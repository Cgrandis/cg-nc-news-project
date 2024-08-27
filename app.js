const express = require('express');
const app = express();
const { getTopics, getApiEndpoints } = require('./controllers/controller')
const endpoints = require('./endpoints.json')

app.use(express.json())

app.get('/api/topics', getTopics);

app.get('/api', getApiEndpoints);



app.use((err, req, res, next) => {
    res.status(err.status || 500).send({ msg: err.msg || 'Internal Server Error' });
  });

module.exports = app;