import React from 'react';
import styled from 'styled-components';


export default styled.table`

    border-collapse: collapse;
    padding: 0;
    margin: 0;
    width: 100%;
    
    font-family: QuicksandRegular, sans-serif;
    font-size: 13px;

    thead {
      background: #f2f2f2;
      color: #676767;
    }
    
    tr {
      text-align: left;
    }
    
    td, th {
      padding: 3px 5px;
    }
    
    td {
      color: #212121;
    }
    
`;