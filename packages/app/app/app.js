import React from 'react';
import ReactDOM from 'react-dom';
import theme from 'ds-awards-theme';
import Root from './Root';
import { createBrowserHistory } from 'history';
import Routes from './routes';

const history = createBrowserHistory();

const makeApolloConfig = ({ cache, link, ...config }) => {
    return {
        cache,
        link,
        ...config
    };
};

const render = () => {
    ReactDOM.render(
        <React.Fragment>
            <Root
                connectToWebSocket={true}
                history={history}
                makeApolloConfig={makeApolloConfig}
                routes={<Routes />}
                theme={theme}
            />
            <div id="ps-modal-root" style={{ height: 0 }} />
        </React.Fragment>,
        document.getElementById('root')
    );
};

render();