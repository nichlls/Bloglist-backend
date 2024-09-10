const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'Title or URL is missing' })
  }

  const savedBlog = await blog.save()
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