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

// TODO: Complete
const mostBlogs = (blogs) => {

}

module.exports = {
  dummy, totalLikes, favouriteBlog
}