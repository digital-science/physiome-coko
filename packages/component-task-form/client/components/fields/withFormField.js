import React from "react";
import styled from 'styled-components';

const FormFieldHolder = styled.div`
    margin-top: 5px;
    margin-bottom: 15px;
`;

export default function withFormField(f, bindingResolver) {

    const r = function(props) {
        return <FormFieldHolder className="form-field">{f(props)}</FormFieldHolder>
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


export { fetchFields, mergeFetchFields };