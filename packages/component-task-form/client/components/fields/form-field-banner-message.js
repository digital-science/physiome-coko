import React from 'react';
import styled from 'styled-components';

import withFormField from './withFormField';
import { BlockLabel } from 'ds-awards-theme/components/label';


const StyledBannerMessage = styled(BlockLabel)`
    background: #b9e0ff;
    padding: 5px;
    text-align: center;
    font-weight: bold;
    color: #636363;
    border-radius: 5px;
    box-shadow: 2px 2px 3px 0 #2196f375;
    border: 1px solid #2196f33b;
`;


function FormFieldBannerMessage({data, binding, options = {}}) {
    return (
        <StyledBannerMessage>{options.message}</StyledBannerMessage>
    );
}

export default withFormField(FormFieldBannerMessage);