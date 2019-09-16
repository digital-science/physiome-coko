import React from "react";
import styled from 'styled-components';

import { bindingToFetchFields } from '../../utils/helpers';

const FormFieldHolder = styled.div`
`;

export default function withFormField(f, bindingResolver) {

    const r = function({className, ...props}) {
        return <FormFieldHolder className={`form-field ${className || ""}`}>{f(props)}</FormFieldHolder>
    };

    if(!bindingResolver) {
        r.bindingResolver = function(e) {
            return e.binding;
        };
    } else {
        r.bindingResolver = bindingResolver;
    }

    return r;
};


function fetchFields(binding, fields) {

    const r = {};

    if(!fields) {
        binding.split(",").forEach(field => {
            r[field.trim()] = null;
        });
        return r;
    }

    const f = {};
    fields.split(",").forEach(field => {
        f[field.trim()] = null;
    });

    let last = r;
    const p = binding.split(".");

    for(let i = 0; i <= p.length - 2; i++) {
        last[p[i]] = {};
        last = last[p[i]];
    }
    last[p[p.length - 1]] = f;

    return r;
}


function complexFetchFields(binding, fields) {

    const f = fields instanceof Array ? fields : fields.split(',');
    const r = {};

    f.forEach(field => {
        mergeFetchFields(r, bindingToFetchFields(`${binding}.${field}`));
    });

    return r;
}



function _mergeAtLevel(dest, src) {

    Object.keys(src).forEach(key => {

        if(dest.hasOwnProperty(key)) {
            if(dest[key] !== null) {
                if(src[key] !== null) {
                    _mergeAtLevel(dest[key], src[key]);
                }
            } else {
                dest[key] = src[key];
            }
        } else {
            dest[key] = src[key];
        }
    });

    return dest;
}



function mergeFetchFields(destFields, srcFields) {

    return _mergeAtLevel(destFields, srcFields);
}


export { fetchFields, complexFetchFields, mergeFetchFields, FormFieldHolder };