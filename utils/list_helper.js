const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 1) {
    return blogs
  }
  return blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }
  if (blogs.length === 1) {
    return {
      author: blogs[0].author,
      blogs: 1
    }
  }
  const authors = blogs.map(blog => blog.author)
  const authorCount = authors.reduce((acc, author) => {
    acc[author] = (acc[author] || 0) + 1
    return acc
  }, {})
  const authorWithMostBlogs = Object.keys(authorCount).reduce((max, author) => authorCount[max] > authorCount[author] ? max : author)
  return {
    author: authorWithMostBlogs,
    blogs: authorCount[authorWithMostBlogs]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }
  if (blogs.length === 1) {
    return {
      author: blogs[0].author,
      likes: blogs[0].likes
    }
  }
  const authors = blogs.map(blog => blog.author)
  const authorLikes = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})
  const authorWithMostLikes = Object.keys(authorLikes).reduce((max, author) => authorLikes[max] > authorLikes[author] ? max : author)
  return {
    author: authorWithMostLikes,
    likes: authorLikes[authorWithMostLikes]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}