function findEmailCodeInLocationHash(hash) {

    if(!hash || !hash.length) {
        return null;
    }

    const hashParts = hash.replace(/^#/g, "").split(",");
    const emailCode = hashParts.filter(part => part.match(/^email_code=[0-9]+$/i))
        .map(code => code.replace(/^email_code=/i, ""))
        .map(code => parseInt(code))
        .filter(code => code && !isNaN(code));

    return (emailCode && emailCode.length === 1) ? emailCode[0] : null;
}

export { findEmailCodeInLocationHash };