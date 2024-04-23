const supertest = require('supertest');
const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const mongoose = require('mongoose');
const helper = require('../utils/list_helper');
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  
  let user = new User({ username: "testuser", password: "password" });

  await user.save();

  let blogObject = helper.initialBlogList.map(blog => new Blog({ ...blog, user: user.id }));

  const promiseArray = blogObject.map(blog => blog.save());
  await Promise.all(promiseArray);

});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    assert(response.body.length === helper.initialBlogList.length);
});

test('id property is returned as id', async () => {
  const response = await api.get('/api/blogs');

  assert(Object.keys(response.body[0]).includes("id"));
});

test('a valid blog can be added', async () => {

  const userLogged = await User.findOne({ username: "testuser" });
  const userForToken = {
    username: userLogged.username,
    id: userLogged._id
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  const newBlog = {
    title: "Test Blog",
    author: "Test Author",
    url: "http://test.com",
    likes: 0,
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  assert(blogsAtEnd.length === helper.initialBlogList.length + 1);
  assert(blogsAtEnd.map(blog => blog.title).includes("Test Blog"));
});

test('if likes property is missing, it will default to 0', async () => {

  const userLogged = await User.findOne({ username: "testuser" });
  const userForToken = {
    username: userLogged.username,
    id: userLogged._id
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  const newBlog = {
    title: "Test Blog",
    author: "Test Author",
    url: "http://test.com"
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const addedBlog = blogsAtEnd.find(blog => blog.title === "Test Blog");
  assert(addedBlog.likes === 0);
});

test('if title and url properties are missing, return 400', async () => {

  const userLogged = await User.findOne({ username: "testuser" });
  const userForToken = {
    username: userLogged.username,
    id: userLogged._id
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  const newBlog = {
    author: "Test Author",
    likes: 0
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  assert(blogsAtEnd.length === helper.initialBlogList.length);
});

test('a blog can be deleted', async () => {

  const userLogged = await User.findOne({ username: "testuser" });
  const userForToken = {
    username: userLogged.username,
    id: userLogged._id
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();
  assert(blogsAtEnd.length === helper.initialBlogList.length - 1);
  assert(!blogsAtEnd.map(blog => blog.title).includes(blogToDelete.title));
});

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[0];
  const updatedBlog = {
    title: "Updated Blog",
    author: "Updated Author",
    url: "http://updated.com",
    likes: 10
  };

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const updatedBlogAtEnd = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
  assert(updatedBlogAtEnd.title === "Updated Blog");
  assert(updatedBlogAtEnd.author === "Updated Author");
  assert(updatedBlogAtEnd.url === "http://updated.com");
  assert(updatedBlogAtEnd.likes === 10);
});

test('a blog can be liked', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToLike = blogsAtStart[0];

  await api
    .put(`/api/blogs/like/${blogToLike.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const likedBlog = blogsAtEnd.find(blog => blog.id === blogToLike.id);
  assert(likedBlog.likes === blogToLike.likes + 1);
});

test('a post cant be added without token', async () => {
  const newBlog = {
    title: "Test Blog",
    author: "Test Author",
    url: "http://test.com",
    likes: 0,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401);
});

test('a post cant be deleted without token', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(401);
});


after(() => {
  mongoose.connection.close();
});