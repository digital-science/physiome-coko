import React from 'react';
import styled from 'styled-components';
import { th } from 'ds-awards-theme';


const _ArticleCitation = ({className, citation, children, maximumAuthors=10}) => {

    if(!citation) {
        return null;
    }

    const { title, volume, issue, authors, year, pages, link, doi } = citation;

    let displayedAuthors = null;

    if(authors instanceof Array) {

        const authorLength = authors ? authors.length : 0;
        const allAuthors = (authors && authors.length) ? (
            authors.slice(0).splice(0, maximumAuthors).map((a, index) => (
                <li key={index}>
                    {a.firstName ? <span>{a.firstName}</span> : null}
                    {a.lastName ? <span>{a.lastName}</span> : null}
                </li>
            ))
        ) : null;

        displayedAuthors = (
            <ol>
                {allAuthors}
                {authorLength > maximumAuthors ? <li>{authorLength - maximumAuthors} more</li> : null}
            </ol>
        );

    } else if(authors && authors.length) {

        displayedAuthors = <div>{authors}</div>;
    }

    if(!title && !volume && !issue && !displayedAuthors && !year && !doi) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className={className}>
            <span className="title">{title}</span>
            {year ? <span className="year">{year}</span> : null}
            {volume ? <span className="vol">{volume}</span> : null}
            {issue ? <span className="issue">{issue}</span> : null}
            {pages ? <span className="pages">pg. {pages}</span> : null}
            .
            {doi ? <span className="doi">DOI: <span>{doi}</span></span> : null}
            {displayedAuthors}
        </div>
    )

};

const ArticleCitation = styled(_ArticleCitation)`
  
  font-family: ${th('citation.fontFamily')};
  font-size: 14px;
  color: ${th('citation.textColor')};
  
  & > span:before {
    content: " "
  }
  
  &:first-child:before {
    content: ""
  }
  
  & .title {
    display: block;
  }
  
  & .title:after {
    content: ""
  }

  & .vol:after {
     content: ";"
  }
    
  & .issue:before {
    content: " ("
  }
    
  & .issue:after {
    content: ")"
  }
    
  & .year:after {
    content: ";"
  }
  
  & .doi > span {
    font-style: italic;
  }
    
  & ol {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  & ol li {
    display: inline;
  }
  
  & ol li span:first-child:after {
    content: ' ';
  }
    
  & ol li:after {
    content: ", "
  }
    & ol li:nth-last-child(2)::after {
    content: " and ";
  }

  & ol li:last-child::after {
    content: "";
  }

`;

export default ArticleCitation;