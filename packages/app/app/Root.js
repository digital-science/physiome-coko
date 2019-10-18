/*
* NOTE: this is based off the pubsweet-client Root component code modified to include the Apollo hooks provider
* the base pubsweet-client Root doesn't provide easy access to the client instance for setting up the hooks provider.
*/


import React, { Fragment, useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Normalize } from 'styled-normalize';

import desc from './../config/description.json';
import { WorkflowDescriptionContext, WorkflowDescription } from 'client-workflow-model';

import { installUserAuthChangedNotifier } from 'component-authentication/client/utils';
import AuthenticationTokenContext from 'component-authentication/client/AuthenticationTokenContext';

const clientWorkflowDescription = new WorkflowDescription(desc);


const makeApolloClient = (makeConfig, connectToWebSocket, authContext) => {
    const httpLink = createHttpLink();
    const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('token');
        authContext.token = token;

        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : '',
            },
        }
    });

    let link = authLink.concat(httpLink);
    let subscriptionClient = null;

    if (connectToWebSocket) {

        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsLink = new WebSocketLink({
            uri: `${wsProtocol}://${window.location.host}/subscriptions`,
            options: {
                reconnect: true,
                lazy: true,
                connectionParams: () => ({
                    authToken: localStorage.getItem('token')
                }),
            },
        });
        link = split(
            ({ query }) => {
                const { kind, operation } = getMainDefinition(query);
                return kind === 'OperationDefinition' && operation === 'subscription';
            },
            wsLink,
            link,
        );

        subscriptionClient = wsLink.subscriptionClient;

        if(!localStorage.getItem('token') && subscriptionClient) {
            subscriptionClient.close(true, true);
        }
    }

    const config = {
        link,
        cache: new InMemoryCache()
    };

    return {client:new ApolloClient(makeConfig ? makeConfig(config) : config), subscriptionClient};
};

const Root = ({
    makeApolloConfig,
    history,
    routes,
    theme,
    connectToWebSocket = true,
}) => {

    const authContext = useMemo(() => { return {}; });
    const {client, subscriptionClient} = makeApolloClient(makeApolloConfig, connectToWebSocket, authContext);

    useEffect(() => {

        return installUserAuthChangedNotifier(() => {

            // When authentication status changes, we either force a connection for subscription WebSockets
            // or force close the current WebSocket connection.

            if(!subscriptionClient) {
                return;
            }

            if(localStorage.getItem('token')) {
                subscriptionClient.connect();
            } else {
                subscriptionClient.close(true, true);
            }
        });
    });

    return (
        <Fragment>
            <Normalize />
            <WorkflowDescriptionContext.Provider value={clientWorkflowDescription}>
                <ApolloProvider client={client}>
                    <ApolloHooksProvider client={client}>
                        <AuthenticationTokenContext.Provider value={authContext}>
                            <BrowserRouter>
                                <ThemeProvider theme={theme}>
                                    {routes}
                                </ThemeProvider>
                            </BrowserRouter>
                        </AuthenticationTokenContext.Provider>
                    </ApolloHooksProvider>
                </ApolloProvider>
            </WorkflowDescriptionContext.Provider>
        </Fragment>
    );
};

/*<StyleRoot>{routes}</StyleRoot>*/

Root.propTypes = {
    routes: PropTypes.node.isRequired,
    history: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default Root
