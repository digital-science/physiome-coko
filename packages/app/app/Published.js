import { DashboardPublished } from 'component-dashboard/client';
import React from 'react';


export default ({history, children}) => {

    return <DashboardPublished history={history}>{children}</DashboardPublished>;
}
