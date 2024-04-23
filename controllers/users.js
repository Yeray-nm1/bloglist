const userRouter = require('express').Router();
const User = require('../models/user');
const Blog = require('../models/blog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blog', { url: 1, title: 1, author: 1 });
  response.json(users.map(user => user.toJSON()));
});

userRouter.post('/', async (request, response, next) => {
  const body = request.body;

  if (!body.password) {
    return response.status(400).json({ error: 'Password is required' });
  }

  if (body.password.length < 3) {
    return response.status(400).json({ error: 'Password must be at least 3 characters long' });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const blogList = await Blog.find({});

  const randomBlogId = blogList[Math.floor(Math.random() * blogList.length)].id;


  const user = new User({
    name: body.name,
    username: body.username,
    password: passwordHash,
    blog: randomBlogId
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (exception) {
    next(exception);
  }
  
});

module.exports = userRouter;