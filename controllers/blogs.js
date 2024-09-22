const blogsRouter = require('express').Router()
const middleware = require('../utils/middleware')

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate({
      path: 'user',
      select: 'username name'
    })

  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const blog = new Blog(request.body)

  const user = request.user

  // Use request body, because blog has been transformed through mongoose
  if (!request.body.userId)
  {
    return response.status(400).json({ error: 'User ID is missing' })
  }

  blog.user = user._id

  if (!blog.title || !blog.url)
  {
    return response.status(400).json({ error: 'Title or URL is missing' })
  }

  const savedBlog = await blog.save()
  // Add new blog to user's blogs array
  user.blogs = user.blogs.concat(savedBlog._id)

  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user

  const id = request.params.id

  const blogToDelete = await Blog.findById(id)
  if (!blogToDelete)
  {
    return response.status(404).json({ error: 'Could not find a blog with supplied ID' })
  }

  let deletedBlog = null

  // Delete if user is creator of blog
  if (blogToDelete.user.toString() === user.id.toString())
  {
    deletedBlog = await Blog.findByIdAndDelete(id)
  }
  else
  {
    return response.status(403).json({ error: 'User does not have permission to delete' })
  }

  if (!deletedBlog)
  {
    return response.status(404).json({ error: 'Could not find a blog with supplied ID' })
  }

  // Remove deleted blog from user.blog parameter
  user.blogs = user.blogs.filter(blogId => blogId.toString() !== id)
  await user.save()

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