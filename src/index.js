const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const res = require("express/lib/response");

const app = express();

app.use(cors());
app.use(express.json());
//onde os usuarios ficam armazenados
const users = [];
//middleware de verificaçao de contas
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}
//rota de criacao de usuario
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const userVerify = users.some((userExist) => userExist.username === username);

  if (userVerify) {
    return response.status(400).json({ error: "user already exists" });
  }

  users.push(user);

  return response.status(201).json(user);
});
//lista os todos do usuario
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { username } = request.headers;

  return response.status(200).json(todos);
});
//cria todos
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    username: user.username,
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { user } = request;
  const id = request.params.id;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    response.status(404).json({ error: "Not found" });
  }

  todo.deadline = deadline;
  todo.title = title;

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    response.status(404).json({ error: "Not found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { user } = request;
  const id = request.params.id;

  console.log(id);

  const userId = user.todos.find((todo) => todo.id === id);

  if (userId) {
    user.todos.splice(userId, 1);
  } else {
    return response.status(404).json({ error: "todo not found" });
  }

  return response.status(204).json(user);
});

module.exports = app;
