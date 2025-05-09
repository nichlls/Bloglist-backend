const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')

const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')

const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

const initialUsers = [
  {
    username: 'root',
    name: 'root',
    password: 'pass123',
  },
  {
    username: 'jsmith',
    name: 'John Smith',
    password: 'pass123',
  }
]

describe('blog api tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const saltRounds = 10
    const userObjects = await Promise.all(initialUsers.map(async (user) => {
      const passwordHash = await bcrypt.hash(user.password, saltRounds)
      return new User({ ...user, passwordHash })
    }))
    const newPromiseArray = userObjects.map(user => user.save())
    await Promise.all(newPromiseArray)

    await Blog.deleteMany({})

    const username = initialUsers[1].username
    const user = await User.findOne({ username })

    const blogObjects = initialBlogs.map(blog => {
      blog.user = user.id
      return new Blog(blog)
    })

    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns correct amount of blog posts', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 6)
  })

  test('unique indentifier property is named id', async () => {
    const response = await Blog.findOne()

    assert.ok(response.id, 'ID field does not exist')
  })

  test('add a blog post', async () => {
    const initialResponse = await api
      .get('/api/blogs')

    const users = await api
      .get('/api/users')

    const userId = users.body[0].id

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'jsmith',
        password: 'pass123'
      })
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const newBlog = {
      title: 'New blog',
      author: 'Alex Ander',
      url: 'https://www.google.com',
      userId: userId,
      likes: 564,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const finalResponse = await api
      .get('/api/blogs')

    assert(finalResponse.body[finalResponse.body.length - 1].title === newBlog.title, 'Title of latest blog does not match new blog')

    assert(finalResponse.body[finalResponse.body.length - 1].content === newBlog.content, 'Content of latest blog does not match new blog')

    assert(finalResponse.body.length === initialResponse.body.length + 1, 'Failed to add new blog')
  })

  test('fail to add blog post without token', async () => {
    const initialResponse = await api
      .get('/api/blogs')

    const users = await api
      .get('/api/users')

    const userId = users.body[0].id

    const newBlog = {
      title: 'New blog',
      author: 'Alex Ander',
      url: 'https://www.google.com',
      userId: userId,
      likes: 564,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const finalResponse = await api
      .get('/api/blogs')

    assert(finalResponse.body.length === initialResponse.body.length, 'Blog was not added')
  })

  test('likes property defaults to 0 when missing', async () => {
    const users = await api
      .get('/api/users')

    const userId = users.body[0].id

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'jsmith',
        password: 'pass123'
      })
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const newBlog = {
      title: 'Test blog',
      author: 'Name Name',
      url: 'https://www.google.com',
      userId: userId,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api
      .get('/api/blogs')

    assert(response.body[response.body.length - 1].likes === 0, 'Blog likes do not at 0')
  })

  test('response is 400 if title or url is missing', async () => {
    const users = await api
      .get('/api/users')

    const userId = users.body[0].id

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: 'jsmith',
        password: 'pass123'
      })
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    const newBlog = {
      author: 'Name Name',
      userId: userId,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

  })

  test('delete a blog', async () => {
    const response = await api
      .get('/api/blogs')

    const blogCreator = await User.findById(response.body[0].user.id)

    const loginResponse = await api
      .post('/api/login')
      .send({
        username: blogCreator.username,
        password: 'pass123'
      })
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token

    await api
      .delete(`/api/blogs/${response.body[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    await api
      .get(`/api/blogs/${response.body[0].id}`)
      .expect(404)
  })

  test('update a blog', async () => {
    const blogs = await api
      .get('/api/blogs')

    const updateData = {
      url: 'http://www.google.com',
      likes: 1050,
    }

    const response = await api
      .put(`/api/blogs/${blogs.body[0].id}`)
      .send(updateData)
      .expect(200)

    assert.strictEqual(response.body.likes, updateData.likes)
    assert.strictEqual(response.body.url, updateData.url)
  })

  after(async () => {
    await mongoose.connection.close()
  })
})