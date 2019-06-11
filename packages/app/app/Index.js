import { Dashboard } from 'component-dashboard/client';
import React from 'react';


export default ({history, children}) => {

    return <Dashboard history={history}>{children}</Dashboard>;
}
