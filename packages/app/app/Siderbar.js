import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import HomeIcon from 'ds-theme/static/home.svg';
import ExpandIcon from 'ds-theme/static/expand.svg';
import { FaTrashAlt } from 'react-icons/fa'


const Sidebar = styled.nav`
    background: rgb(62,56,120);
    background: linear-gradient(180deg, rgba(62,56,120,1) 0%, rgba(51,175,188,1) 100%);
    
    order: -1;
    width: 76px;
    padding-top: 7px;
    
    > div {
        padding: 15px 25px;
    }
    
    > div.selected {
        background: #33afbc;
    }
    
    & svg {
        color: white;
        text-decoration: none;
        font-size: 26px;
    }
    
    @media (min-width: 768px) {
        flex: 0 0 76px;
    }
`;

export default () => {

    const pathIsPublished = (window.location.pathname || []).toLowerCase() === '/published';
    const pathIsRejected = (window.location.pathname || []).toLowerCase() === '/rejected';

    return (
        <Sidebar>

            <div className={(!pathIsPublished && !pathIsRejected) ? "selected" : ""}>
                <Link to={`/`}>
                    <img alt="Home" src={HomeIcon} />
                </Link>
            </div>

            <div className={pathIsPublished ? "selected" : ""}>
                <Link to={`/published`}>
                    <img alt="Expand" src={ExpandIcon} />
                </Link>
            </div>

            <div className={pathIsRejected ? "selected" : ""}>
                <Link to={`/rejected`}>
                    <FaTrashAlt />
                </Link>
            </div>

        </Sidebar>
    );
};