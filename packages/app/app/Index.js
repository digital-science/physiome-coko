import { DashboardActive } from 'component-dashboard/client';
import React from 'react';


export default ({history, children}) => {

    return <DashboardActive history={history}>{children}</DashboardActive>;
}
