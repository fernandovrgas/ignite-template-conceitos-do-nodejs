const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) return response.status(404).send({ message: "User not found" })

  request.user = user
  
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (!name || !username) return response.status(500).send({ error: 'Name and Username is required!' }) 

  const user = users.find(user => user.username === username)

  if (user) return response.status(400).send({ error: "User alright exists"})

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  response.status(201).send(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  if (!title || !deadline) return response.status(500).send({ error: "Title and Deadline is required!" })

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }
  
  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).send({ error: "Todo not found!" })
  
  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).send({ error: "Todo not found!" })
  
  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) return response.status(404).send({ error: "Todo not found!" })

  user.todos.splice(todoIndex, 1)

  return response.status(204).json(user.todos)
});

module.exports = app;