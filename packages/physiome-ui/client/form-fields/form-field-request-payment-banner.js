import React, { useState } from 'react';
import styled from 'styled-components';

import useCheckoutSessionForSubmission from '../queries/getCheckoutSessionForSubmission';

import { withFormField } from 'component-task-form/client';

import Card, { CardContent } from 'ds-theme/components/card';
import StaticText, { LargeStaticText } from 'ds-theme/components/static-text';
import InlineButton from 'ds-theme/components/inline-button';
import Spinner from 'ds-theme/components/spinner';

import config from 'config';

const stripe = Stripe(config['stripe-publishable-key']);



function FormFieldRequestPaymentBanner({instanceId, refetchData}) {

    const [fetchingSessionId, setFetchingSessionId] = useState(false);
    const [getCheckSession] = useCheckoutSessionForSubmission();

    function onClickPayNow() {

        if(fetchingSessionId) {
            return;
        }

        setFetchingSessionId(true);

        getCheckSession(instanceId).then(result => {

            const { status, sessionId } = result;

            // If already paid, then we force a refresh on the data set.
            if(status === 'AlreadyPaid') {
                setFetchingSessionId(false);
                return refetchData();
            }

            stripe.redirectToCheckout({sessionId}).then(function (result) {
                // If `redirectToCheckout` fails due to a browser or network
                // error, display the localized error message to your customer
                // using `result.error.message`.

                console.dir(result);
            });

        }).catch(err => {

            setFetchingSessionId(false);
        });
    }

    return (
        <FormFieldRequestPaymentBannerHolder>
            <Card>
                <div className="primary">
                    <LargeStaticText>
                        Payment Required
                    </LargeStaticText>
                    <StaticText>
                        This manuscript submission has been approved for publishing. Before publishing can be completed the article processing fee must be paid.
                        Please click "Pay Now" to submit payment for the article processing charge.
                    </StaticText>
                </div>
                <div className="secondary">
                    <div className={fetchingSessionId ? "fetching" : ""}>
                        <InlineButton bordered={true} onClick={onClickPayNow}>
                            {fetchingSessionId ? <Spinner small={true} center={true} clear={true} /> : null}
                            <span>Pay Now</span>
                        </InlineButton>
                    </div>
                </div>
            </Card>
        </FormFieldRequestPaymentBannerHolder>
    );
}


const FormFieldRequestPaymentBannerHolder = styled.div`  

  margin-top: 15px;
  margin-bottom: 15px;
  
  ${LargeStaticText} {
    display: block;
    font-weight: bolder;
    color: #004882;
    margin-bottom: 4px;
  }
  
  & ${Card} {
    background: #e2f6ff;
    border: 1px solid #b7e8ff;
    box-shadow: 4px 4px 4px 0 #e2f6ff;
    padding: 15px 20px;
  }
  
  & ${CardContent} {
    display: flex;
    flex-wrap: nowrap;
  }
  
  & ${CardContent} > div.primary {
    flex-basis: 75%;
  }
    
  & ${CardContent} > div.secondary {
    flex-basis: 25%;
    text-align: center;    
    
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    ${InlineButton} {
        position: relative;
        padding: 8px 20px;
        font-size: 100%;
        border: 1px solid #b7e8ff;
        font-weight: bold;
        color: white;
        background: #2196F3;
    }
        
    ${InlineButton}:hover {
        background: #1f7bcd;
    }
    
    ${InlineButton} ${Spinner} {
        position: absolute;
        top: calc(50% - 9px);
        left: calc(50% - 9px);
    }
  }
  
  & ${CardContent} > div.secondary > .fetching ${InlineButton} > span {
    visibility: hidden;
  }

`;

export default withFormField(FormFieldRequestPaymentBanner);