import React, { useMemo } from 'react';
import styled from 'styled-components';
import { th } from '../src/index';
import PropTypes from 'prop-types';

import Paginate from 'jw-paginate';


const PageLink = styled.a`
    cursor: pointer;
    padding: 6px 12px;
    display: block;
    float: left;
    color: ${th('pagination.textColor')}
    border-radius: 5px;

    :hover {
      background: #cacaca;
    }
`;


const Page = styled.li`
    display: inline;
    text-align: center;
    
    &.active {
      > ${PageLink} {
        background: #cacaca;
        cursor: default;
      }
    }
    
    &.disabled {      
      > ${PageLink} {
        cursor: default;
        color: ${th('pagination.disabledTextColor')}
      }
      
      > ${PageLink}:hover {
        background: initial;
      }
      
    }
`;

const PageFirst = styled(Page)`
`;

const PageLast = styled(Page)`
`;

const PagePrevious = styled(Page)`
`;

const PageNext = styled(Page)`
`;

const PageNumber = styled(Page)`
`;

const Labels = {
    first: 'First',
    last: 'Last',
    previous: 'Previous',
    next: 'Next'
};


const _Pagination = ({className, totalItems, currentPage, pageSize, maxPages, setPage}) => {

    const pager = useMemo(() => {
        return Paginate(totalItems, currentPage, pageSize, maxPages);
    }, [totalItems, currentPage, pageSize, maxPages]);


    // No pages or a single page, don't display anything.
    if (!pager.pages || pager.pages.length <= 1) {
        return null;
    }


    return (
        <ul className={className}>

            <PageFirst className={`page-item first ${pager.currentPage === 1 ? 'disabled' : ''}`}>
                <PageLink onClick={() => setPage(1)}>{Labels.first}</PageLink>
            </PageFirst>

            <PagePrevious className={`page-item previous ${pager.currentPage === 1 ? 'disabled' : ''}`}>
                <PageLink className="page-link" onClick={() => setPage(pager.currentPage - 1)}>{Labels.previous}</PageLink>
            </PagePrevious>

            {pager.pages.map((page, index) =>
                <PageNumber key={index} className={`page-item page-number ${pager.currentPage === page ? 'active' : ''}`}>
                    <PageLink className="page-link" onClick={() => setPage(page)}>{page}</PageLink>
                </PageNumber>
            )}

            <PageNext className={`page-item next ${pager.currentPage === pager.totalPages ? 'disabled' : ''}`}>
                <PageLink className="page-link" onClick={() => setPage(pager.currentPage + 1)}>{Labels.next}</PageLink>
            </PageNext>

            <PageLast className={`page-item last ${pager.currentPage === pager.totalPages ? 'disabled' : ''}`}>
                <PageLink className="page-link" onClick={() => setPage(pager.totalPages)}>{Labels.last}</PageLink>
            </PageLast>

        </ul>
    );
};

const Pagination = styled(_Pagination)`
    margin: 0;
    padding: 0;
    display: inline-block;
    list-style: none;
    font-family: ${th('pagination.fontFamily')};
    font-size: ${th('pagination.fontSize')};
    
    > ${Page} + ${Page} > ${PageLink} {
      margin-left: 5px;
    }
`;

Pagination.propTypes = {
    totalItems: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired
};

export default Pagination;