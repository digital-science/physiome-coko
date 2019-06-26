import React, {Fragment, useMemo} from 'react';
import styled from 'styled-components';

import FieldListing from './field-listing';
import { FormFieldHolder } from './fields/withFormField';

import Spinner from 'ds-awards-theme/components/spinner';


export default function SideBySideHeroLayout({ className, elements, data, loading, error, instance, fieldListingProps }) {

    const {panels, decisionPanel} = useMemo(() => {

        if(!elements) {
            return null;
        }

        const panels = [];
        let decisionPanel = null;

        elements.forEach(element => {
            if(element.type === "Panel" && element.children) {
                panels.push(element);
            } else if(element.type === "DecisionPanel") {
                decisionPanel = element;
            }
        });

        return {panels, decisionPanel};

    }, [elements]);

    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!loading && !instance) {
        return <div>Instance Not Found</div>
    }

    return (data && !loading) ? (

        <SideBySideHeroHolder className={className}>
            <PanelHolder>
                {panels.map((panel, index) =>
                    <Fragment key={index}>
                        <Panel>
                            {panel.options && panel.options.heading ? <PanelHeading heading={panel.options.heading} /> : null}
                            <FieldListing elements={panel.children} {...fieldListingProps} />
                        </Panel>
                        {(index !== panels.length - 1) ? <PanelDivider /> : null}
                    </Fragment>
                )}
            </PanelHolder>

            {decisionPanel ? (
                <DecisionPanelHolder>
                    <DecisionFieldListing elements={decisionPanel.children} {...fieldListingProps} />
                </DecisionPanelHolder>
            ) : null}

        </SideBySideHeroHolder>

    ) : (
        <SideBySideHeroHolder className={`${className || ""} loading`}>
            <Spinner center={true} message={"Loading"} />
        </SideBySideHeroHolder>
    );
};


const SideBySideHeroHolder = styled.div`
  &.loading {
    text-align: center;
  }
`;


const Panel = styled.div`
  min-width: 450px;
`;

const PanelDivider = styled.div`
  min-width: 40px;
  max-width: 40px;
`;


const PanelHeading = styled(({className, heading}) => {
    return (
        <div className={className}>
            <span>{heading}</span>
        </div>
    );
})`
  margin-bottom: 10px;
  
  > span {
    font-size: 18px;
    font-family: ProximaNovaBold, sans-serif;
    color: #424242;
  }
`;

const PanelHolder = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 940px;
  margin: 0 auto;
  justify-content: center;
`;


const DecisionPanelHolder = styled.div`
  margin-top: 10px;
  margin-bottom: -20px;
  margin-left: -20px;
  margin-right: -20px;
  padding: 20px;
  background: #ebebeb;
`;


const DecisionFieldListing = styled(FieldListing)`
  
  max-width: unset;
  display: flex;
  justify-content: center;
  
  > ${FormFieldHolder} {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
  }
  
  > ${FormFieldHolder} + ${FormFieldHolder} {
    margin-top: 0;
  }
  
  & > ${FormFieldHolder}:last-child {
    margin-bottom: 0;
  }
`;


export { DecisionPanelHolder, DecisionFieldListing };