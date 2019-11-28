module.exports = {

    'pubsweet-server': {
        graphiql: false
    },

    orcid: {
        orcidUrl: 'orcid.org',
        orcidDisplayUrl: 'orcid.org',
    },

    'figshare-widgets-hostname': process.env.FIGSHARE_WIDGETS_HOSTNAME || "widgets.figshare.com",

    logging: {
        debugAclRules: false
    }
};
