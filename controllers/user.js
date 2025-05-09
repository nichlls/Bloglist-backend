const usersRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate({
      path: 'blogs',
      select: 'url title author id'
    })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (username.length < 3)
  {
    return response.status(400).json({ error: 'Username is too short' })
  }

  if (!password)
  {
    return response.status(400).json({ error: 'Password is required' })
  } else if (password.length < 3)
  {
    return response.status(400).json({ error: 'Password is too short' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter