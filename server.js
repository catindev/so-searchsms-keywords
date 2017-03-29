// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const L = require('lodash');
const uid = require('uid');

const JsonDB = require('node-json-db');
const db = new JsonDB("Keywords", true, false);
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

function checkToken(req, res, next) {
    if (req.query.access_token && req.query.access_token === ACCESS_TOKEN ) {
        next();
    } else {
       res.json({status:403, message: 'Access Token Invalid'})
    }
}

app.use( bodyParser.urlencoded({ extended: true }) );
app.use( bodyParser.json() );
app.use( checkToken );

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
// app.get("/", function (request, response) {
//   response.sendFile(__dirname + '/views/index.html');
// });

app.get("/", function (request, response) {
  // response.sendFile(__dirname + '/views/index.html');
  response.json({ about: 'Search SMS Keywords Storage' });
});

app.get("/v1/keywords", function (request, response) {
  const dicts = db.getData("/");
  const resp = L.isEmpty( dicts ) ? { items:[] } : { items: L.keys(dicts) };
  response.json( resp );
});

app.post("/v1/keywords", function (request, response) {
  if ( !request.body.name ) {
    return response.json({status:400, message: 'Dictionary name required'})
  }
  
  const { name } = request.body.name ;
  const id = uid();
  
  db.push('/' + id,{ name, items: [] });
  response.json({ name, id });
});

// db.delete("/test1");

app.get("/v1/flush", function (request, response) {
  db.delete("/");
  response.sendStatus(200);
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
