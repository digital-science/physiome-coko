function validCitations(citations) {

    if(!citations || !citations.length) {
        return 0;
    }
    return citations.filter(c => c.title && c.title.trim().length).length;
}

exports.validCitations = validCitations;


function correspondingAuthors(v) {

    if(!v || !v.length) {
        return 0;
    }
    return v.filter(a => a.isCorresponding === true).length;

}

exports.correspondingAuthors = correspondingAuthors;



function validIdentity(identity) {
    return (identity && !!identity.id);
}

exports.validIdentity = validIdentity;
