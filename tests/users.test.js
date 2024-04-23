const supertest = require('supertest');
const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
});

test('a valid user can be added', async () => {
  const newUser = {
    name: "Test User",
    username: "testuser",
    password: "password"
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const usersAtEnd = await User.find({});
  assert(usersAtEnd.length === 1);
  assert(usersAtEnd[0].name === "Test User");
  assert(usersAtEnd[0].username === "testuser");
});

test('if password property is missing, it will return a 400 status code', async () => {
  const newUser = {
    name: "Test User",
    username: "testuser"
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400);
});

test('if password property is less than 3 characters, it will return a 400 status code', async () => {
  const newUser = {
    name: "Test User",
    username: "testuser",
    password: "12"
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400);
});

test('if username property is missing, it will return a 400 status code', async () => {
  const newUser = {
    name: "Test User",
    password: "password"
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400);
});

test('if username property is less than 3 characters, it will return a 400 status code', async () => {
  const newUser = {
    name: "Test User",
    username: "12",
    password: "password"
  };

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400);
});

after(() => {
  mongoose.connection.close();
});