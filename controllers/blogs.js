const blogsRouter = require('express').Router()

const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate({
      path: 'user',
      select: 'username name'
    })

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  // Token auth
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Invalid token' })
  }
  const user = await User.findById(decodedToken.id)

  // Use request body, because blog has been transformed through mongoose
  if (!request.body.userId)
  {
    return response.status(400).json({ error: 'User ID is missing' })
  }

  blog.user = user._id

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'Title or URL is missing' })
  }

  const savedBlog = await blog.save()
  // Add new blog to user's blogs array
  user.blogs = user.blogs.concat(savedBlog._id)

  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  const deletedBlog = await Blog.findByIdAndDelete(id)

  if (!deletedBlog) {
    return response.status(404).json({ error: 'Could not find a blog with supplied ID' })
  }

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const data = request.body

  const updated = {}

  if (data.likes) {
    updated.likes = data.likes
  }

  if (data.url) {
    updated.url = data.url
  }

  const blogToUpdate = await Blog.findByIdAndUpdate(id,
    { $set: updated },
    { new: true, runValidators: true })

  if (!blogToUpdate) {
    return response.status(404).json({ error: 'Could not find a blog with supplied ID' })
  }

  response.status(200).json(blogToUpdate)
})

module.exports = blogsRouter