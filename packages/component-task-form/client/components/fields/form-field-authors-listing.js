import React, { Fragment, useMemo } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import styled from 'styled-components';

import { useFormValueBindingForComplexObject } from '../../hooks/useFormValueBinding';
import withFormField from "./withFormField";

import useGetResolvedOrcidIds from '../../queries/getResolvedOrcidIds';

import { BlockLabel } from "ds-theme/components/label";
import { DisabledStaticText } from "ds-theme/components/static-text";
import { th } from "ds-theme";
import Spinner from "ds-theme/components/spinner";


const AuthorRow = styled.li`
  > div {
    margin-left: 24px;
    padding-top: 5px;
    font-size: 95%;
    color: #505050;
  }
  
  > div > img {
    vertical-align: bottom;
  }
  
  > ul {
    font-size: 95%;
  }
  
  > ul.details {
     display: block;
     list-style: none;
     padding: 0.25em 0 0.25em 0;
     margin-left: 24px;
         
     li {
       display: inline;
     }
     
     li span {
       display: inline-block;
       /*color: white;*/
       /*font-family: SFCompactDisplayRegular,sans-serif;
       font-size: 12px;*/
       /*background-color: #98cff1;
       padding: 3px 8px;
       border-radius: 3px;*/
     }
     
     li:after {
       content: ", ";
     }
     
     li:last-child:after {
        content: "";
     }

  }
`;


const AuthorListing = styled( ({className, authors}) => {

    const orcidIsToResolve = useMemo(() => {
        return authors ? authors.map(a => a.orcid || null).filter(v => !!v) : null;
    }, authors);

    const resolvedOrcids = useGetResolvedOrcidIds(orcidIsToResolve);

    //console.dir(resolvedOrcids);
    //

    return (
        <ol className={className}>
            {authors.map((author, index) => {

                const affiliations = author.affiliations ? author.affiliations.filter(a => a.organization && a.organization.name) : null;
                const details = [];

                if(author.isCorresponding) {
                    details.push(`Corresponding Author`);
                }

                if(author.didDevelopModel) {
                    details.push(`Contributed to Reproducible Model`);
                }

                if(author.isPrimaryPaperAuthor) {
                    details.push(`Author on Primary Paper`);
                }

                const resolvedOrcid = resolvedOrcids && resolvedOrcids.hasOwnProperty(author.orcid) ? resolvedOrcids[author.orcid] : null;

                return (
                    <AuthorRow key={index}>
                        {index + 1}. {author.name} - {author.email}
                        {author.orcid ?
                            <Fragment>
                                <div>ORCID:&nbsp;
                                    <img src={'https://orcid.org/sites/default/files/images/orcid_16x16.gif'} alt={'ORCID icon'} />&nbsp;
                                    <a href={`https://orcid.org/${encodeURI(author.orcid)}`} className={'orcid'} target="_blank" rel="noopener noreferrer">https://orcid.org/{author.orcid}</a>
                                    <span className={'resolved-orcid'}>&nbsp;
                                        {resolvedOrcids !== null ?
                                            (resolvedOrcid ? <span><FaArrowRight /> {resolvedOrcid.givenNames} {resolvedOrcid.familyNames}</span> : <span><FaArrowRight /> Unable to resolve ORCID data</span>)
                                            :
                                            (<Spinner small={true} />)
                                        }
                                    </span>
                                </div>
                            </Fragment> : null
                        }
                        {details.length ?
                            <Fragment>
                                <div>Relationships:</div>
                                <ul className={'details'}>
                                    {details.map((d, index) => <li key={index}><span>{d}</span></li>)}
                                </ul>
                            </Fragment> : null}
                        { affiliations ?
                            <Fragment>
                                <div>Affiliations:</div>
                                <ul>
                                    {affiliations.map((a, i) => <li key={i}>{a.organization.name}{a.department ? <span>, {a.department}</span> : null}</li>)}
                                </ul>
                            </Fragment>
                            : null
                        }
                    </AuthorRow>
                );
            } )}
        </ol>
    );
})`
  
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: ${th('authorListing.fontFamily')};
  font-size: ${th('authorListing.fontSize')};
  
  & > li + li {
    margin-top: 5px;
  }
  
  span.resolved-orcid svg {
    vertical-align: middle;
    height: 0.8em;
    width: 0.8em;
  }

`;

function _FormFieldAuthorsListing({ className, data, binding, instanceId, instanceType, options = {} }) {

    const [authors] = useFormValueBindingForComplexObject(data, binding);

    return (
        <div className={className}>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            {(authors && authors instanceof Array && authors.length) ?
                <AuthorListing authors={authors} /> : <DisabledStaticText>No Authors were specified</DisabledStaticText>
            }
        </div>
    );
}

const FormFieldAuthorsListing = withFormField(_FormFieldAuthorsListing);

export default FormFieldAuthorsListing;