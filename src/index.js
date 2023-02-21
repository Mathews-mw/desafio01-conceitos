const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'Usuário não encontrado' });
  }

  request.user = user;
  
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  userAlreadyExist = users.find(user => user.username === username); 
  if(userAlreadyExist) {
    return response.status(400).json({ error: 'Usuário já cadastrado!' })
  }

  try {
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.push(newUser);

    return response.status(201).json(newUser);
  } catch (error) {
    return response.status(404).json({ Error: 'Erro ao tentar cadastrar usuário', message: error.toString()})
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
 
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const {  title, deadline } = request.body;

  const userTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(userTodo);

  return response.status(201).json(userTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user; 
  const { id } = request.params;
  const { title, deadline } = request.body;

  const currentTodo = user.todos.find(todo => todo.id === id);

  if(!currentTodo) {
    return response.status(404).json({ error: 'Todo não encontrada' })
  }

  currentTodo.title = title;
  currentTodo.deadline = new Date(deadline);

  return response.status(200).json(currentTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user; 
  const { id } = request.params;

  const currentTodo = user.todos.find(todo => todo.id === id);

  if(!currentTodo) {
    return response.status(404).json({ error: 'Todo não encontrada' })
  }

  currentTodo.done = true;

  return response.status(200).json(currentTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user; 
  const { id } = request.params;

  const currentIndexTodo = user.todos.findIndex(todo => todo.id === id);

  if(currentIndexTodo === -1) {
    return response.status(404).json({ error: 'Todo não encontrada' })
  }

  user.todos.splice(currentIndexTodo, 1);

  return response.status(204).send();
});

module.exports = app;