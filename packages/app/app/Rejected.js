import { DashboardRejected } from 'component-dashboard/client';
import React from 'react';


export default ({history, children}) => {

    return <DashboardRejected history={history}>{children}</DashboardRejected>;
}
