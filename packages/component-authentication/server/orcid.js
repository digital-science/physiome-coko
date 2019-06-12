const OrcidStrategy = require('passport-orcid');
const config = require("config");
const authentication = require('@pubsweet/model-user/src/authentication');

const { models } = require('component-workflow-model/model');
const { UniqueViolationError } = require('component-model');
const { Identity } = models;

const { clientID, clientSecret, callbackPath, successPath, authenticatePath } = config.get('orcid');

const logger = require('@pubsweet/logger');


function encodeBase64(string) {
    return (new Buffer(string)).toString('base64');
}

function decodeBase64(encodedString) {
    return (new Buffer(encodedString, 'base64')).toString('utf8');
}


module.exports = (app) => {

    const { passport } = app.locals;
    const options = {
        sandbox: process.env.NODE_ENV !== 'production',
        callbackURL: `${config.get('pubsweet-client.baseUrl')}${callbackPath}`,
        clientID,
        clientSecret
    };

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    const orcid = new OrcidStrategy(options, (accessToken, refreshToken, params, profile, done) => {

        profile = {
            orcid: params.orcid,
            name: params.name,
            accessToken,
            refreshToken,
            scope: params.scope,
            expiry: params.expires_in,
        };

        return done(null, profile);
    });

    passport.use(orcid);


    app.get(authenticatePath,
            (req, res, next) => {

                const {redirect=successPath} = req.query;
                const state = JSON.stringify({redirect}, null, 4);

                passport.authenticate('orcid', {
                    state: encodeBase64(state)
                })(req, res, next);
            }
    );

    app.get(callbackPath,
            passport.authenticate('orcid', {
                failureRedirect: successPath,
            }),
            didAuthenticateWithORCID,
    );
};



async function _findOrCreateUser(profile) {

    const existingIdentity = await Identity.findOneByField('identityId', profile.orcid);
    if(existingIdentity) {
        return existingIdentity;
    }

    const newIdentity = new Identity({
        created: new Date().toISOString(),
        updated: new Date().toISOString(),

        type: 'orcid',
        identityId: profile.orcid,
        displayName: profile.name,

        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        accessScope: profile.scope,
        accessTokenExpire: profile.expiry
    });

    try {

        await newIdentity.save();

    } catch(e) {

        if(e instanceof UniqueViolationError) {
            const existingIdentity = await Identity.findByField('identityId', profile.orcid);
            if(existingIdentity) {
                return existingIdentity.id;
            }
            return null;
        }

        logger.error(`Unable to create new user identity (from ORCID authentication attempt) due to: ${e.toString()}`);
        return null;
    }

    return newIdentity;
}



function didAuthenticateWithORCID(req, res) {

    const decodedStateJson = req.query.state ? decodeBase64(req.query.state) : null;
    let state = null;

    if(decodedStateJson && decodedStateJson.length) {
        try {
            state = JSON.parse(decodedStateJson);
        } catch(e) {
            return res.status(400).send("Authenticate via ORCID failed due to an invalid state parameter.");
        }
    }

    const { redirect = successPath } = (state || {});
    const profile = req.user;

    if(!profile) {
        //FIXME: should show a generic error page instead in this situation.
        return res.redirect(successPath || "/");
    }

    _findOrCreateUser(profile).then(identity => {

        const tokenData = {
            id: identity.id,
            username: identity.displayName
        };

        const token = authentication.token.create(tokenData);
        return res.send(RedirectTemplate(redirect || successPath || "/", token));

    }).catch(err => {

        //FIXME: should show a generic error page instead in this situation.
        return res.redirect(successPath || "/");
    });
}


const RedirectTemplate = (redirect, token) => {

    return `
        <html>
            <body></body>
            <script>
                localStorage.setItem("token", "${token}");
                window.location.href = "${redirect}";
            </script>
        </html>
    `;

};