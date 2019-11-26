import React from 'react';
import { Redirect } from 'react-router-dom';

const LogoutRoute = ({}) => {

    window.localStorage.removeItem("token");

    // We need to dispatch an event for this local window (as events don't trigger for local events).
    const event = document.createEvent("Event");
    event.initEvent("storage", true, true);
    event.key = "token";

    window.dispatchEvent(event);

    return <Redirect to={{pathname: "/"}}/>;
};

export default LogoutRoute;