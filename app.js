const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};
initialize();
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  console.log(status);
  console.log(priority);
  console.log(search_q);
  const statusQuery = `
    select * from
    todo 
    WHERE status  LIKE '%${status}%' AND priority LIKE '%${priority}%' and todo LIKE '%${search_q}%';`;

  const dbResponse = await db.all(statusQuery);
  response.send(dbResponse);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodoQuery = `
    SELECT 
    * 
    from 
    todo
    where id ='${todoId}';`;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;

  const postQuery = `
    INSERT INTO 
    todo(id,todo,status,priority)
    VALUES(${id},'${todo}','${status}','${priority}');`;
  const dbResponse = await db.run(postQuery);
  const lastId = dbResponse.lastID;
  console.log(lastId);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodoQuery = `
    DELETE FROM
    todo
    where id ='${todoId}';`;
  const dbResponse = await db.get(getTodoQuery);
  response.send("Todo Deleted");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let { status, todo, priority } = request.body;
  let dbResponse = null;
  switch (true) {
    case status !== undefined:
      const statusQuery = `
        update todo 
        set status='${status}'
        where id = ${todoId};`;
      dbResponse = await db.run(statusQuery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      const priorityQuery = `
        update todo 
        set priority='${priority}'
        where id = ${todoId};`;
      dbResponse = await db.run(priorityQuery);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      const todoQuery = `
        update todo 
        set todo='${todo}'
        where id = ${todoId};`;
      dbResponse = await db.run(todoQuery);
      response.send("Todo Updated");
  }
});

module.exports = app;
