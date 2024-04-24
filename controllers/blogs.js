const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs.map(blog => blog.toJSON()))
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  const blog = new Blog(request.body)

  blog.user = request.user.id

  if (!blog.likes) {
    blog.likes = 0
  }

  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (exception) {
    next(exception)
  }
  
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== request.user.id) {
    return response.status(401).json({ error: 'only the user who created the blog can delete it' })
  }

  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true }).populate('user', { username: 1, name: 1 })
    response.json(updatedBlog)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/like/:id', async (request, response, next) => {
  try {
    const oldBlog = await Blog.findById(request.params.id)
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { likes: oldBlog.likes + 1 }, { new: true }).populate('user', { username: 1, name: 1 })
    response.json(updatedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter