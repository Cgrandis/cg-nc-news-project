const express = require('express');
const app = express();
const { getTopics, getArticles, getArticlesById, getCommentsByArticleId } = require('./controllers/get-controller')
const { addCommentToArticle } = require('./controllers/post-controller')
const { getApiEndpoints } = require('./controllers/api-endpoints-controller')
const { updateArticleVotes } = require('./controllers/patch-controller');
const { deleteCommentById } = require('./controllers/api-delete-controller')

app.use(express.json())

app.get('/api', getApiEndpoints);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticlesById);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', addCommentToArticle)

app.patch('/api/articles/:article_id', updateArticleVotes);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.use((err, req, res, next) => {
  if (err.code === '22P02') { 
      res.status(400).send({ msg: 'Invalid article_id' });
  } else {
      res.status(500).send({ msg: 'Internal server error' });
  }
});


module.exports = app;