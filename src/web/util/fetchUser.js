const axios = require('axios')
const log = require('../../util/logger.js')
const WebCache = require('../../models/WebCache.js').model()
const discordAPIConstants = require('../constants/discordAPI.js')
const discordAPIHeaders = require('../constants/discordAPIHeaders.js')

async function getCachedUser (id) {
  const cachedUser = await WebCache.findOne({
    id,
    type: 'user'
  }).lean().exec()
  return cachedUser
}

async function getCachedUserGuilds (id) {
  const cachedGuilds = await WebCache.findOne({
    id,
    type: 'guilds'
  }).lean().exec()
  return cachedGuilds
}

async function storeCachedUser (id, data) {
  const found = await WebCache.findOne({
    id,
    type: 'user'
  })
  if (found) {
    found.data = data
    await found.save()
    return found
  }
  const cached = new WebCache({
    id,
    type: 'user',
    data
  })
  await cached.save()
  return cached
}

async function storeCachedUserGuilds (id, data) {
  const cached = new WebCache({
    id,
    type: 'guilds',
    data
  })
  await cached.save()
  return cached
}

async function info (id, accessToken, skipCache) {
  const cachedUser = id && !skipCache ? await getCachedUser(id) : null
  if (cachedUser) return cachedUser.data
  log.web.info(`[1 DISCORD API REQUEST] [USER] GET /api/users/@me`)
  const { data } = await axios.get(`${discordAPIConstants.apiHost}/users/@me`, discordAPIHeaders.user(accessToken))
  await storeCachedUser(data.id, data)
  return data
}

async function guilds (id, accessToken, skipCache) {
  const cachedUserGuilds = id && !skipCache ? await getCachedUserGuilds(id) : null
  if (cachedUserGuilds) return cachedUserGuilds.data
  log.web.info(`[1 DISCORD API REQUEST] [USER] GET /api/users/@me/guilds`)
  const { data } = await axios.get(`${discordAPIConstants.apiHost}/users/@me/guilds`, discordAPIHeaders.user(accessToken))
  await storeCachedUserGuilds(id, data)
  return data
}

module.exports = { info, guilds }
