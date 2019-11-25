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



function validUri(uri) {

    if(!uri) {
        return false;
    }

    if(typeof uri !== 'string') {
        return false;
    }

    return !!uri.match(/^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)$/);
}

exports.validUri = validUri;


function fileCount(files) {

    if(!files || !files.length) {
        return 0;
    }
    return files.filter(a => a.removed !== true).length;

}

exports.fileCount = fileCount;
