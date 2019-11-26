import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import PersonIcon from 'ds-theme/static/person.svg';

import useCurrentUser from 'component-authentication/client/withCurrentUser';
import AuthenticatedUserContext from 'component-authentication/client/AuthenticatedUserContext';


const Header = styled.header`
    min-height: 68px;
    line-height: 68px;
    margin-left: 30px;
    font-size: 36px;
    font-family: NovcentoSansWideLight, sans-serif;
    text-transform: uppercase;
    
    & a,
    & a:visited {
      color: #3e3476;
      text-decoration: none;
    }
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
            <Link to="/">Physiome Submission Portal</Link>
            {children}
        </Header>
    );
};


export default ({hideUser=false}) => {

    const currentUser = useContext(AuthenticatedUserContext);

    if(hideUser) {
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
                <Link to={'/logout'}>
                    <Person>
                        <img alt="person" src={PersonIcon} />
                        <span>{currentUser.username}</span>
                    </Person>
                </Link>)
                : null}
        </BaseHeader>
    );
};