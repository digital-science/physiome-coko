import React, { useMemo, useContext } from 'react';
import styled from 'styled-components';

import FieldListing from './field-listing';
import { FormFieldHolder } from './fields/withFormField';
import { FormFieldViewerEditorLayoutHolder } from './fields/form-field-viewer-editor-layout';

import AuthenticatedUserContext from "component-authentication/client/AuthenticatedUserContext";

import Spinner from 'ds-theme/components/spinner';
import { InlineButton, SmallInlineButton } from 'ds-theme/components/inline-button';


export default function MasterDetailLayout({ className, elements, data, loading, error, instance, fieldListingProps, renderPageAdditionsWithData = null }) {

    const currentUser = useContext(AuthenticatedUserContext);

    const [masterPanels, detailPanels, headerPanels] = useMemo(() => {

        if(!elements) {
            return null;
        }

        const masterPanelsSet = [];
        const detailPanelsSet = [];
        const headerPanelsSet = [];

        elements.forEach(element => {

            if(element.children) {
                if(element.type === "MasterPanel") {
                    masterPanelsSet.push(element);
                } else if(element.type === "DetailPanel") {
                    detailPanelsSet.push(element);
                } else if(element.type === "HeaderPanel") {
                    headerPanelsSet.push(element);
                }
            }
        });

        return [masterPanelsSet, detailPanelsSet, headerPanelsSet];

    }, [elements]);


    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!loading && !instance) {
        return <div>Instance Not Found</div>
    }

    // FIXME: we should probably try and cache the user targets and condition evaluations (would need to observe data changes potentially though)

    return (data && !loading) ? (

        <MasterDetailHolder className={className}>

            {renderPageAdditionsWithData ? renderPageAdditionsWithData(instance, data, currentUser) : null}

            <HeaderHolder>
                {headerPanels.map((panel, index) => {
                    if(!panel.userIsTargetOfElement(currentUser)) {
                        return null;
                    }
                    if(panel.condition && !panel.condition.evaluate(data, 'client')) {
                        return null;
                    }
                    return (
                        <HeaderPanel key={index}>
                            {panel.options && panel.options.heading ? <PanelHeading heading={panel.options.heading} /> : null}
                            <FieldListing elements={panel.children} {...fieldListingProps} />
                        </HeaderPanel>
                    );
                })}
            </HeaderHolder>

            <MasterDetailContentHolder>

                <MasterHolder>
                    {masterPanels.map((panel, index) => {
                        if(!panel.userIsTargetOfElement(currentUser)) {
                            return null;
                        }
                        if(panel.condition && !panel.condition.evaluate(data, 'client')) {
                            return null;
                        }
                        return (
                            <MasterPanel key={index}>
                                {panel.options && panel.options.heading ? <PanelHeading heading={panel.options.heading} /> : null}
                                <FieldListing elements={panel.children} {...fieldListingProps} />
                            </MasterPanel>
                        );
                    })}
                </MasterHolder>

                <DetailHolder>
                    {detailPanels.map((panel, index) => {
                        if(!panel.userIsTargetOfElement(currentUser)) {
                            return null;
                        }
                        if(panel.condition && !panel.condition.evaluate(data, 'client')) {
                            return null;
                        }
                        return (
                            <DetailPanel key={index}>
                                {panel.options && panel.options.heading ? <PanelHeading heading={panel.options.heading} /> : null}
                                <FieldListing elements={panel.children} {...fieldListingProps} />
                            </DetailPanel>
                        );
                    })}
                </DetailHolder>
            </MasterDetailContentHolder>
        </MasterDetailHolder>

    ) : (

        <MasterDetailHolder className={`${className || ""} loading`}>
            <Spinner center={true} message={"Loading"} />
        </MasterDetailHolder>
    );
};


const MasterDetailHolder = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  &.loading {
    text-align: center;
  }
  
  & > div {
    flex-basis: 100%;
  }
`;

const HeaderHolder = styled.div`
    box-sizing: border-box;
    max-width: 1000px;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
    
    & ${FieldListing} {
      max-width: unset;
    }
`;

const MasterDetailContentHolder = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    max-width: 1000px;
    width: 100%;
`;


const MasterHolder = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  border-right: 1px solid #ebebeb;
  
  flex-basis: 75%;
`;

const DetailHolder = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  
  flex-basis: 25%;
  min-width: 300px;
`;


const Panel = styled.div`
  ${FormFieldHolder} + ${FormFieldHolder} {
     margin-top: 15px;
  }

  ${FormFieldHolder}.type-checkbox + ${FormFieldHolder}.type-checkbox {
    margin-top: 15px;
  }
  
  & ${SmallInlineButton},
  & ${InlineButton} {
      box-shadow: 2px 2px 5px 0 #00000033;
  }
  
  & ${FormFieldViewerEditorLayoutHolder} ${SmallInlineButton},
  & ${FormFieldViewerEditorLayoutHolder} ${InlineButton} {
      box-shadow: none;
  }

`;


const HeaderPanel = styled(Panel)``;

const MasterPanel = styled(Panel)``;

const DetailPanel = styled(Panel)``;



const PanelHeading = styled(({className, heading, children}) => {
    return (
        <div className={className}>
            <span>{heading}</span>
            {children}
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

export { MasterDetailHolder, Panel, PanelHeading, MasterPanel, DetailPanel };