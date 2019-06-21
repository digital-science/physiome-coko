import React from 'react';
import styled from 'styled-components';

import './spinner.css';

const MessageHolder = styled.div`
  display: inline-block;
  margin: 0 5px;
  
  .loader {
    margin-top: 1px;
  }
  
  span.message {
    font-family: QuicksandRegular, sans-serif;
    font-size: 13px;
    color: #2f2f2f;
  }
  
  span.message:before {
    content: " "
  }
`;

const _Spinner = ({className, center, small, message}) => {

    const cn = `loader ${small ? 'loader-small small' : 'loader-normal'} ${center ? 'center' : ''}`;

    if(message) {
        return (
            <MessageHolder className={className}>
                <div className={cn} /> <span className="message">{message}</span>
            </MessageHolder>
        );
    }

    return <div className={`${className} ${cn}`} />;
};

const Spinner = styled(_Spinner)``;

export default Spinner;