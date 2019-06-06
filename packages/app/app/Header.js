import React from 'react';
import styled from 'styled-components';

import PersonIcon from 'ds-awards-theme/static/person.svg';

import useCurrentUser from 'component-authentication/client/withCurrentUser';


const Header = styled.header`
    min-height: 68px;
    line-height: 68px;
    margin-left: 30px;
    font-size: 36px;
    font-family: NovcentoSansWideLight, sans-serif;
    text-transform: uppercase;
    color: #3e3476;
`;

const Person = styled.div`
    line-height: 36px;
    height: 36px;
    padding: 16px;
    display: inline-block;
    float: right;
    cursor: pointer;

    > img {
        height: 36px;
    }
    
    > span {
        margin-left: 10px;
    
        color: black;
        text-transform: none;
        font-size: 15px;
        font-family: AcuminProLight, sans-serif;
            
        height: 100%;
        display: inline-block;
        vertical-align: top;
    }
`;


const BaseHeader = ({children}) => {
    return (
        <Header>
            Physiome Submission Portal
            {children}
        </Header>
    );
};


export default ({hideUser=false}) => {

    const { currentUser, error, loading } = useCurrentUser();

    if(hideUser) {
        return (
            <BaseHeader />
        );
    }

    if(error || loading) {
        return (
            <BaseHeader />
        );
    }

    const logoutUser = () => {
        window.localStorage.removeItem("token");

        // We need to dispatch an event for this local window (as events don't trigger for local events).
        const event = document.createEvent("Event");
        event.initEvent("storage", true, true);
        event.key = "token";

        window.dispatchEvent(event);
    };

    return (
        <BaseHeader>
            {currentUser ? (
                <Person onClick={logoutUser}>
                    <img alt="person" src={PersonIcon} />
                    <span>{currentUser.username}</span>
                </Person>)
                : null}
        </BaseHeader>
    );
};