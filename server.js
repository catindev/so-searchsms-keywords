const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const L = require('lodash');
const uid = require('uid');

const JsonDB = require('node-json-db');
const db = new JsonDB('Keywords', true, false);

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '6zGxe6S7rI';

function checkToken(request, response, next) {
  const { access_token } = request.query;

  access_token && access_token === ACCESS_TOKEN
    ? next()
    : response.status(403).json({
      status: 403,
      message: 'Access Token Invalid'
    })
    ;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(checkToken);
// app.use( express.static('public') );

app.get("/", (request, response) => response.json({
  about: 'Search SMS Keywords Storage'
}));

app.get("/v1/keywords", (request, response) => {
  const items = db.getData("/");
  response.json(items);
});

app.get("/v1/keywords/:id", (request, response) => {
  let dict;
  try {
    dict = db.getData("/" + request.params.id);
  } catch (error) {
    response.status(404).json({
      status: 404,
      message: 'Dictionary not found'
    })
  }
  response.json(dict);
});

app.post("/v1/keywords", (request, response) => {
  if (!request.body.name) {
    return response.status(400).json({
      status: 400,
      message: 'Dictionary name required'
    })
  }

  const { name } = request.body;
  const id = uid();

  db.push('/' + id, { id, name, items: [] });
  response.json({ name, id });
});

app.post("/v1/keywords/:id", (request, response) => {
  let dict;

  try {
    dict = db.getData("/" + request.params.id);
  } catch (error) {
    response.status(404).json({
      status: 404,
      message: 'Dictionary not found'
    })
  }

  if (!request.body.name) {
    return response.json({
      status: 400,
      message: 'Keyword name required'
    })
  }

  const { name } = request.body;
  const id = uid();

  if (dict.items.indexOf(name) === -1) {
    dict.items.push(name);
    db.push('/' + request.params.id, dict);
  }
  response.sendStatus(200);
});

app.delete("/v1/keywords", (request, response) => {
  db.delete("/");
  response.sendStatus(200);
});

app.delete("/v1/keywords/:id", (request, response) => {
  let dict;

  try {
    dict = db.getData("/" + request.params.id);
  } catch (error) {
    response.status(404).json({
      status: 404,
      message: 'Dictionary not found'
    })
  }


  if (request.query.keyword) {
    const index = dict.items.indexOf(request.query.keyword);
    if (index !== -1) {
      dict.items.splice(index, 1);
      db.push('/' + request.params.id, dict);
      return response.sendStatus(200);
    } else {
      return response.status(404).json({
        status: 404,
        message: 'Keyword not found'
      })
    }
  }

  db.delete("/" + request.params.id);
  response.sendStatus(200);
});

const listener = app.listen(process.env.PORT, function () {
  console.log('App is listening on port ' + listener.address().port);
});
