import styled from 'styled-components';
import config from 'config';
import React from "react";

const ORCIDLoginButton = styled(props => {

    const gotoORCIDAuth = () => {
        window.location.href = config['orcid-paths'].authenticatePath + "?redirect=" + encodeURIComponent(window.location.pathname);
    };

    return (
        <button {...props} onClick={gotoORCIDAuth}>
            <img id="orcid-id-icon" src="https://orcid.org/sites/default/files/images/orcid_24x24.png" width="24" height="24" alt="ORCID iD icon"/>
            Login with your ORCID iD
        </button>
    )
})`

	border: 1px solid #D3D3D3;
	padding: .3em;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 1px 1px 3px #999;
	cursor: pointer;
	color: #999;
	font-weight: bold;
	font-size: .8em;
	line-height: 24px;
	vertical-align: middle;

    &:hover{
        border: 1px solid #338caf;
        color: #338caf;
    }
    
    #orcid-id-icon{
        display: block;
        margin: 0 .5em 0 0;
        padding: 0;
        float: left;
    }
`;

const NoCurrentUserHolder = styled.div`
  
    text-align: center;
    padding: 20px;
`;

const LoginToBeginHolder = styled.div`

  width: 350px;
  margin: auto auto;
  background: white;
  padding: 40px;
  box-shadow: 3px 3px 8px 2px #00000026;
  
  > p {
    font-family: QuicksandRegular, sans-serif;
    margin-top: 0;
    margin-bottom: 20px;
  }
`;


export default ({message}) => {
    return (
        <NoCurrentUserHolder>
            <LoginToBeginHolder>
                <p>{message}</p>
                <ORCIDLoginButton />
            </LoginToBeginHolder>
        </NoCurrentUserHolder>
    );
};