import React from 'react';
import styled, { css } from 'styled-components';


const _Button = ({tag, plain=false, children=null, ...rest}) => {

    if(tag) {
        return <tag {...rest}>{children}</tag>
    }
    return <button {...rest}>{children}</button>
};

const Button = styled(_Button)`
    
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #349fb4), color-stop(1, #3781a3));
    background:-moz-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:-webkit-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:-o-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:-ms-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:linear-gradient(to bottom, #349fb4 5%, #3781a3 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#349fb4', endColorstr='#3781a3',GradientType=0);
    background-color:#349fb4;
    -moz-border-radius:28px;
    -webkit-border-radius:28px;
    border-radius:28px;
    display:inline-block;
    cursor:pointer;
    color:#ffffff;
    font-family: NovcentoSansWideNormal, sans-serif;
    font-size:15px;
    padding:6px 24px;
    text-decoration:none;
    text-transform: uppercase;
        
    outline: none;
    border: none;
    
    &:hover {
        background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #3781a3), color-stop(1, #349fb4));
        background:-moz-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:-webkit-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:-o-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:-ms-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:linear-gradient(to bottom, #3781a3 5%, #349fb4 100%);
        filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#3781a3', endColorstr='#349fb4',GradientType=0);
        background-color:#3781a3;
    }
    &:active {
        position:relative;
        top:1px;
    }
    &:disabled {
      opacity: 0.25;
    }
    
    ::-moz-focus-inner {
      border: 0;
    }
    
    &:focus:not(:active) {
        box-shadow: 0 0 2px 2px #2196F3;
        border-color: #2196F3;
        outline: 0;
    }

`;

const PlainButtonStyle = css`
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #979797), color-stop(1, #505050));
    background:-moz-linear-gradient(top, #979797 5%, #505050 100%);
    background:-webkit-linear-gradient(top, #979797 5%, #505050 100%);
    background:-o-linear-gradient(top, #979797 5%, #505050 100%);
    background:-ms-linear-gradient(top, #979797 5%, #505050 100%);
    background:linear-gradient(to bottom, #979797 5%, #505050 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#979797', endColorstr='#505050',GradientType=0);
    background-color:#979797;
    
    &:hover {
        background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #505050), color-stop(1, #979797));
        background:-moz-linear-gradient(top, #505050 5%, #979797 100%);
        background:-webkit-linear-gradient(top, #505050 5%, #979797 100%);
        background:-o-linear-gradient(top, #505050 5%, #979797 100%);
        background:-ms-linear-gradient(top, #505050 5%, #979797 100%);
        background:linear-gradient(to bottom, #505050 5%, #979797 100%);
        filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#505050', endColorstr='#979797',GradientType=0);
        background-color:#979797;
    }
`;


const PlainButton = styled(Button)`
    ${PlainButtonStyle}
`;


const SmallButtonStyle = css`
  padding: 4px 16px;
  font-size:12px;
  
  -moz-border-radius:20px;
  -webkit-border-radius:20px;
  border-radius:20px;
`;

const _SizeSmall = (tag) => {
    return styled(tag)`
  ${SmallButtonStyle}
`;
};

const SmallPlainButton = _SizeSmall(PlainButton);


export default Button;

export { PlainButtonStyle, SmallButtonStyle };

export { Button, PlainButton, SmallPlainButton };

