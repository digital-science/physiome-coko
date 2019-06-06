import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

import CloseIcon from './../static/close.svg';


Modal.setAppElement(document.getElementById('root'));

const customStyles = {
    overlay: {
        backgroundColor: '#00000090',
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },

    content : {
        position: "unset",
        top: null,
        left: null,
        bottom: null,
        right: null,
        /*top                 : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'*/
    }
};


const OverlayCloseButton = styled.button`
    border: none;
    cursor: pointer;
    
    > img {
        width: 20px;
        height: 20px;
        opacity: 0.5;
    }
`;


function _OverlayHeader({className, heading, hasClose, close}) {
    return (
        <div className={className}>
            {heading ? <span>{heading}</span> : null}
            {hasClose ? <OverlayCloseButton onClick={close}><img alt="close" src={CloseIcon} /></OverlayCloseButton> : null}
        </div>
    )
}

const OverlayHeader = styled(_OverlayHeader)`

    margin-top: -20px;
    margin-left: -20px;
    margin-right: -20px;
    margin-bottom: 20px;
    
    padding: 10px 20px;
    border-bottom: 1px solid #d1d1d1;
    
    > span {
        font-size: 28px;
        font-family: NovcentoSansWideLight, sans-serif;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    > button {
        float: right;
        margin-top: 5px;
    }
`;



function Overlay({children, heading, hasClose, close, style, ...rest}) {
    return (
        <Modal style={style || customStyles} {...rest}>
            <OverlayHeader heading={heading} hasClose={hasClose} close={close} />
            {children}
        </Modal>
    );
}

export default Overlay;