import React from 'react';
import styled from 'styled-components';


const _Checkbox = ({...rest}) => {
    return <input type="checkbox" {...rest} />
};

const StyledCheckbox = styled(_Checkbox)`
    margin-right: 5px;
`;

const _SizeSmall = (tag) => {
    return styled(tag)`
  
  font-size:12px;
`;
};

const SmallCheckBox = _SizeSmall(StyledCheckbox);



const _CheckboxLabel = ({children=null, ...rest}) => {
    return <label {...rest}>{children}</label>
};

const StyledCheckboxLabel = styled(_CheckboxLabel)`
    font-family: ProximaNovaLight,sans-serif;
    font-size: 14px;
    color: black;  
`;

const SmallCheckboxLabel = _SizeSmall(StyledCheckboxLabel);


export default StyledCheckbox;
export { StyledCheckbox as Checkbox, SmallCheckBox, StyledCheckboxLabel as CheckboxLabel, SmallCheckboxLabel };

