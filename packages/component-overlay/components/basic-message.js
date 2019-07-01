import React from 'react';
import styled from 'styled-components';

import { BasicOverlay } from "./overlay";
import { InlineButton } from "ds-awards-theme/components/inline-button";
import { th } from "ds-awards-theme";


const BasicMessageContent = styled.div`
  min-width: 400px;
  max-width: 550px;
  
  & p.error {
    
    
  }
`;

const BasicMessageErrorHolder = styled.div`
  position: relative;
  padding-left: 34px !important;

  font-family: ${th('modal.fontFamily')};
  color: #b10c00;
  font-size: 90%;
  background: #a70b0021;
  padding: 10px;
  border-radius: 8px;
  margin-top: 20px;
  margin-bottom: 20px;
  line-height: 1.2;

  > svg {
      position: absolute;
      top: 13px;
      left: 10px;
    }
`;

const BasicMessageHeading = styled.div`
  margin-bottom: 15px;
  font-family: ${th('modal.fontFamily')};
  font-size: ${th('modal.headingFontSize')};
  font-weight: ${th('modal.headingFontWeight')};
  color: ${th('modal.headingTextColor')};
`;

const BasicMessageText = styled.div`
  margin-top: 15px;
  margin-bottom: 15px;
  font-family: ${th('modal.fontFamily')};
  font-size: ${th('modal.messageFontSize')};
  color: ${th('modal.messageTextColor')};
`;


const BasicMessageButtonSet = styled.div`
  text-align: right;
  margin-top: 15px;
  
  > ${InlineButton} + ${InlineButton} {
    margin-left: 10px;
  }
`;

const BasicMessageButton = ({bordered=true, children, ...rest}) => {

    return <InlineButton bordered={bordered} {...rest}>{children}</InlineButton>;
};


const _BasicMessageOverlay = ({className, heading, message, errorMessage, children, buttons, isOpen, closeOverlay, changedEmailAddress}) => {

    return (
        <BasicOverlay isOpen={isOpen} onRequestClose={closeOverlay}>
            <div className={className}>
                <BasicMessageContent>
                    {heading ? <BasicMessageHeading>{heading}</BasicMessageHeading> : null}
                    {message ? <BasicMessageText>{message}</BasicMessageText> : null}
                    {children}
                    {errorMessage ? <BasicMessageErrorHolder><FaExclamationCircle/> {errorMessage}</BasicMessageErrorHolder> : null}
                    {buttons ? <BasicMessageButtonSet>{buttons}</BasicMessageButtonSet> : null}
                </BasicMessageContent>
            </div>
        </BasicOverlay>
    );
};

const BasicMessageOverlay = styled(_BasicMessageOverlay)`


`;


export default BasicMessageOverlay;

export { BasicMessageContent, BasicMessageHeading, BasicMessageText, BasicMessageErrorHolder };
export { BasicMessageButton, BasicMessageButtonSet }