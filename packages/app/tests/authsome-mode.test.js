process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.SUPPRESS_NO_CONFIG_WARNING = true
const Chance = require('chance')
const { models, fixtures } = require('fixture-service')

const chance = new Chance()
const authsomeMode = require('../config/authsome-mode')

describe('authsome mode', () => {
  describe('admin policy', () => {
    it('should return false when the user is logged in but not admin', async () => {
      let team
      team = fixtures.getTeamByRole('admin')
      if (!team) team = fixtures.generateTeam({ role: 'admin' })

      const user = fixtures.generateUser({})
      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        user.id,
        { policies: ['admin'] },
        {},
        context,
      )
      expect(result).toEqual(false)
    })
    it('should return success when the user is admin', async () => {
      let team
      team = fixtures.getTeamByRole('admin')
      if (!team) team = fixtures.generateTeam({ role: 'admin' })
      const user = fixtures.generateUser({})

      const teamMember = fixtures.generateTeamMember({
        userId: user.id,
        teamId: team.id,
      })
      team.members.push(teamMember)

      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        user.id,
        { policies: ['admin'] },
        {},
        context,
      )
      expect(result).toEqual(true)
    })
    it('should return false when the user is not logged in', async () => {
      let team
      team = fixtures.getTeamByRole('admin')
      if (!team) team = fixtures.generateTeam({ role: 'admin' })

      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        chance.guid(),
        { policies: ['admin'] },
        {},
        context,
      )
      expect(result).toEqual(false)
    })
  })

  describe('admin or editor in chief policy', () => {
    it('should return false when the user is logged in but not admin or EiC', async () => {
      let team
      const role = chance.pickone(['admin', 'editorInChief'])
      team = fixtures.getTeamByRole(role)
      if (!team) team = fixtures.generateTeam({ role })

      const user = fixtures.generateUser({})
      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        user.id,
        { policies: ['adminOrEditorInChief'] },
        {},
        context,
      )
      expect(result).toEqual(false)
    })
    it('should return success when the user is admin or editorInChief', async () => {
      let team
      const role = chance.pickone(['admin', 'editorInChief'])
      team = fixtures.getTeamByRole(role)
      if (!team) team = fixtures.generateTeam({ role })

      const user = fixtures.generateUser({})

      const teamMember = fixtures.generateTeamMember({
        userId: user.id,
        teamId: team.id,
      })
      team.members.push(teamMember)

      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        user.id,
        { policies: ['adminOrEditorInChief'] },
        {},
        context,
      )
      expect(result).toEqual(true)
    })
  })

  describe('handling editor policy', () => {
    it('should return false when the user is logged in but not handling editor', async () => {
      const manuscript = fixtures.generateManuscript()

      const team = fixtures.getTeamByRoleAndManuscriptId({
        id: manuscript.id,
        role: 'handlingEditor',
      })
      if (!team) {
        return false
      }

      const user = fixtures.generateUser({})
      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        user.id,
        manuscript.id,
        { policies: ['handlingEditorOnManuscript'] },
        {},
        context,
      )
      expect(result).toEqual(false)
    })

    it('should return success when the user is handling editor', async () => {
      const manuscript = fixtures.generateManuscript()
      const user = fixtures.generateUser({})
      const team = fixtures.generateTeam({
        role: 'handlingEditor',
        manuscriptId: manuscript.id,
      })

      const teamMember = fixtures.generateTeamMember({
        userId: user.id,
        teamId: team.id,
      })
      team.members.push(teamMember)

      const context = {}
      context.models = models.build(fixtures)
      const result = await authsomeMode(
        user.id,
        manuscript.id,
        { policies: ['handlingEditorOnManuscript'] },
        {},
        context,
      )
      expect(result).toEqual(true)
    })
  })
})
