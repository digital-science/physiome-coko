import React, { useMemo } from 'react'
import styled from 'styled-components';

const TaskRow = styled.tr`
    background-color: white;
    
    td {
        padding: 15px;
    }
    
    td.date > span {
        color: darkgrey;
    }
`;


const TaskTableRow = ({columns, task, refreshListing, history, workflowDescription, ...rest}) => {

    const renderedColumns = useMemo(() => {
        return columns.map((col, index) => {

            return col.renderRowContent({columnIndex: index, task, refreshListing, history, workflowDescription})
        });
    }, [columns, task, refreshListing]);

    return (
        <TaskRow {...rest}>
            {renderedColumns}
        </TaskRow>
    );
};

export default TaskTableRow;