const Promise = require('bluebird');
const config = require('config');
const { last } = require('lodash');

// const GLOBAL_ROLES = config.get('globalRoles')

const authsomeMode = async (userId, { name, policies = [] }, object, context) =>
    Promise.reduce(
        policies,
        async (acc, policy) => {
            if (acc === false) return acc;

            if (typeof policy === 'function') {
                return policy(userId, name, object, context);
            }
            if (typeof authsomePolicies[policy] === 'function') {
                return authsomePolicies[policy](userId, name, object, context);
            }
            throw new Error(
                `⛔️ Cannot find policy '${policy}' for action '${name}'.`
            );
        },
        true
    );

const authsomePolicies = {
    authenticatedUser(userId, name, object, context) {
        return !!userId;
    },
    unauthenticatedUser(userId, name, object, context) {
        return !userId;
    },
    async admin(userId, name, object, context) {
        const adminTeam = await context.models.Team.findOneByField(
            'role',
            'admin',
            'members'
        );

        if (!adminTeam) return false;
        const isAdmin = adminTeam.members.find(
            member => member.userId === userId
        );

        return !!isAdmin;
    },
    async handlingEditorOnManuscript(userId, name, object, context) {
        const manuscriptHandlingEditorTeam = await context.models.Team.findOneBy(
            {
                queryObject: {
                    manuscriptId: object.manuscriptId,
                    role: 'handlingEditor'
                },
                eagerLoadRelations: 'members'
            }
        );
        if (!manuscriptHandlingEditorTeam) return false;
        const isHandlingEditorOnManuscript = manuscriptHandlingEditorTeam.members.find(
            member => member.userId === userId
        );
        return !!isHandlingEditorOnManuscript;
    },
    async adminOrEditorInChief(userId, name, object, context) {
        const teams = await context.models.Team.findIn(
            'role',
            ['admin', 'editorInChief'],
            'members'
        );

        if (teams.length === 0) return false;

        const isEiCorAdmin = teams.some(team =>
            team.members.find(member => member.userId === userId)
        );

        return isEiCorAdmin;
    },
    async hasAccessToManuscript(userId, name, object, context) {
        const user = await context.models.User.find(
            userId,
            'teamMemberships.[team]'
        );
        const globalRole = user.getGlobalRole();

        /* if (GLOBAL_ROLES.includes(globalRole)) {
      return true
    } */

        const matchingMember = user.teamMemberships.find(
            member => member.team.manuscriptId === object.manuscriptId
        );

        return !!matchingMember;
    },
    async hasAccessToManuscriptVersions(
        userId,
        name,
        object,
        {
            models: { Manuscript, User, TeamMember }
        }
    ) {
        const user = await User.find(userId, 'teamMemberships.[team]');
        const globalRole = user.getGlobalRole();

        const manuscripts = await Manuscript.findManuscriptsBySubmissionId({
            submissionId: object.submissionId,
            excludedStatus: Manuscript.Statuses.draft
        });
        const manuscriptIds = manuscripts.map(m => m.id);

        if (last(manuscripts).status === Manuscript.Statuses.deleted)
            return false;

        /* if (GLOBAL_ROLES.includes(globalRole)) {
      return true
    } */
        const matchingMember = user.teamMemberships
            .filter(
                member =>
                    member.status !== TeamMember.Statuses.declined &&
                    member.status !== TeamMember.Statuses.expired
            )
            .find(member => manuscriptIds.includes(member.team.manuscriptId));

        return !!matchingMember;
    }
};

module.exports = authsomeMode;
