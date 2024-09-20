const express = require('express');
const app = express();
const cors = require('cors');
const { getArticles, getArticlesById } = require('./controllers/articlesController');
const { getCommentsByArticleId, addCommentToArticle, deleteCommentById  } = require('./controllers/commentController');
const { getApiEndpoints } = require('./controllers/api-endpoints-controller');
const { updateArticleVotes } = require('./controllers/votesController');
const { getTopics } = require('./controllers/topicsController');
const { getUsers } = require('./controllers/usersController')

app.use(express.json())
app.use(cors());


app.get('/api', getApiEndpoints);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticlesById);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.get('/api/users', getUsers);

app.post('/api/articles/:article_id/comments', addCommentToArticle);

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