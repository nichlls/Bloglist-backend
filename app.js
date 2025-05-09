const config = require('./utils/config')
// const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const MONGODB_URI = config.MONGODB_URI

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')

mongoose.set('strictQuery', false)

// logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(MONGODB_URI)

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app