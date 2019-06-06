import React, { Fragment } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import styled, { createGlobalStyle } from 'styled-components';

import { GlobalStyle } from 'ds-awards-theme';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Siderbar';


const AppGlobalStyles = createGlobalStyle`
  body {
    height: 100vh;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale; 
  }
`;


const App = ({ children, hideSidebar, hideUser }) => (
    <Fragment>
        <AppGlobalStyles />
        <GlobalStyle />

        <Header hideUser={hideUser}/>
        <BodyContainer>
            <ContentContainer>{children}</ContentContainer>
            {hideSidebar ? null : <Sidebar>Nav</Sidebar>}
        </BodyContainer>
        <Footer/>
    </Fragment>
);


export default DragDropContext(HTML5Backend)(App);


const BodyContainer = styled.div`
    display: flex;
    flex: 1 0 auto; /* 2 */
    flex-direction: column;
    background-color: #ebebeb;
    
    @media (min-width: 768px) {
        flex-direction: row;
        min-height: calc(100vh - 68px);
    }
`;

const ContentContainer = styled.main`
    @media (min-width: 768px) {
        flex: 1;
        margin: 0;
    }
`;