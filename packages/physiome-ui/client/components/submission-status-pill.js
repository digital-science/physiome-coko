import React from 'react';
import styled from 'styled-components';

import Spinner from 'ds-theme/components/spinner';


const SubmissionStatusMapping = {
};

const SubmissionStatus = {
    Pending: 'Pending',
    Saved: 'Saved',
    Submitted: 'Submitted',
    Checking: 'Checking',
    Decision: 'Decision',
    Payment: 'Payment',
    Paid: 'Paid',
    SkipPayment: 'SkipPayment',
    Publish: 'Publish',
    Reject: 'Reject',
    Published: 'Published',
    Cancelled: 'Cancelled'
};

SubmissionStatusMapping[SubmissionStatus.Pending] = {
    text:"Pending",
    className: "pending"
};

SubmissionStatusMapping[SubmissionStatus.Saved] = {
    text:"Saved for Later",
    className: "saved"
};

SubmissionStatusMapping[SubmissionStatus.Submitted] = {
    text:"Submitted",
    className: "submitted"
};

SubmissionStatusMapping[SubmissionStatus.Checking] = {
    text:"Checking",
    className: "checking"
};

SubmissionStatusMapping[SubmissionStatus.Decision] = {
    text:"Decision",
    className: "decision"
};

SubmissionStatusMapping[SubmissionStatus.Payment] = {
    text:"Payment",
    className: "payment"
};

SubmissionStatusMapping[SubmissionStatus.Paid] = {
    text:"Paid",
    className: "paid"
};

SubmissionStatusMapping[SubmissionStatus.SkipPayment] = {
    text:"Payment Waived",
    className: "paid"
};

SubmissionStatusMapping[SubmissionStatus.Publish] = {
    text:"Publish",
    className: "publish",
    spinner: true
};

SubmissionStatusMapping[SubmissionStatus.Reject] = {
    text:"Rejected",
    className: "rejected"
};

SubmissionStatusMapping[SubmissionStatus.Published] = {
    text:"Published",
    className: "published"
};

SubmissionStatusMapping[SubmissionStatus.Cancelled] = {
    text:"Cancelled",
    className: "cancelled"
};


function _SubmissionStatusPill({className, phase, task, onHold=false, curator=null, ignoreHidden=false}) {

    const usedPhase = task ? task.phase : phase;
    const isOnHold = (task ? task.hidden : onHold);
    const hasCuratorAssigned = !!(task ? task.curator : curator);

    if(isOnHold && ignoreHidden !== true) {
        return <div className={`${className} on-hold`}>On-hold</div>
    }

    let status = (usedPhase && SubmissionStatusMapping.hasOwnProperty(usedPhase)) ? SubmissionStatusMapping[usedPhase] : SubmissionStatusMapping[SubmissionStatus.Pending];

    if(usedPhase === SubmissionStatus.Submitted && hasCuratorAssigned) {
        status = SubmissionStatusMapping[SubmissionStatus.Checking];
    }

    return (
        <React.Fragment>
            <div className={`${className} ${status.className}`}>{status.text}</div>
            {status.spinner === true ? <SubmissionSpinner small={true} />  : null}
        </React.Fragment>
    );
}

const SubmissionSpinner = styled(Spinner)`
    margin-left: 5px;
    margin-top: 3px;
`;


const SubmissionStatusPill = styled(_SubmissionStatusPill)`
    display: inline-block;
    color: white;
    font-family: SFCompactDisplayRegular, sans-serif;
    text-transform: uppercase;
    font-size: 12px;
    background-color: #98cff1;
    padding: 3px 8px;
    border-radius: 3px;
    letter-spacing: 0.05em;
    
    &.pending,
    &.saved,
    &.on-hold {
        border: 1px solid #505050;
        color: #505050;
        background: white;
        padding-top: 2px;
        padding-bottom: 2px;
    }
    
    &.submitted {
        background-color: #FFC107;
    }
    
    &.checking {
        background-color: #8dc56d;
    }
        
    &.payment {
        background-color: #ada600;
    }
    
    &.paid {
        background-color: #00acad;
    }

    &.publish {
        background-color: #adadad;
    }
        
    &.rejected,
    &.cancelled {
        background-color: #e5000a;
    }
    
    &.decision {
        background-color: #9800f1;
    }
`;


export default SubmissionStatusPill;