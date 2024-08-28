const express = require('express');
const app = express();
const { getTopics, getApiEndpoints, getArticles, getArticlesById, getCommentsByArticleId } = require('./controllers/controller')


app.use(express.json())

app.get('/api', getApiEndpoints);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticlesById);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.use((err, req, res, next) => {
  if (err.code === '22P02') {  // Example: PostgreSQL error code for invalid text representation
      res.status(400).send({ msg: 'Invalid article_id' });
  } else {
      res.status(500).send({ msg: 'Internal server error' });
  }
});


module.exports = app;