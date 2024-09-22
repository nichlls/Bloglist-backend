const logger = require('./logger')

const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorisation = request.get('authorization')

  if (authorisation && authorisation.startsWith('Bearer '))
  {
    request.token = authorisation.replace('Bearer ', '')
  } else
  {
    request.token = null
  }

  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token)
  {
    return response.status(401).json({ error: 'Invalid token' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const user = await User.findById(decodedToken.id)

  if (!user)
  {
    request.user = null
    return response.status(404).json({ error: 'Invalid user' })
  } else
  {
    request.user = user
  }

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
