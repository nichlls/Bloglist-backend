const User = require('../models/user')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
  const mostLikes = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])

  const favouriteBlog = {
    title: mostLikes.title,
    author: mostLikes.author,
    likes: mostLikes.likes
  }

  return favouriteBlog
}

const mostBlogs = (blogs) => {
  const authorBlogs = {}

  blogs.forEach(blog => {
    const author = blog.author
    if (author in authorBlogs) {
      authorBlogs[author] += 1
    }
    else
    {
      authorBlogs[author] = 1
    }
  })

  let highestAuthor = ''
  let highestBlogCount = 0

  for (const author in authorBlogs)
  {
    if (authorBlogs[author] > highestBlogCount)
    {
      highestBlogCount = authorBlogs[author]
      highestAuthor = author
    }
  }

  return {
    author: highestAuthor,
    blogs: highestBlogCount
  }

}

const mostLikes = (blogs) => {
  const authorBlogs = {}

  blogs.forEach(blog => {
    const author = blog.author
    if (author in authorBlogs) {
      authorBlogs[author] += blog.likes
    }
    else
    {
      authorBlogs[author] = blog.likes
    }
  })

  let highestAuthor = ''
  let highestLikeCount = 0

  for (const author in authorBlogs)
  {
    if (authorBlogs[author] > highestLikeCount)
    {
      highestLikeCount = authorBlogs[author]
      highestAuthor = author
    }
  }

  return {
    author: highestAuthor,
    likes: highestLikeCount
  }
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  dummy, totalLikes, favouriteBlog, usersInDb, mostBlogs, mostLikes
}