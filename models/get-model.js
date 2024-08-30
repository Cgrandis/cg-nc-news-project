const db = require('../db/connection');

exports.getAllTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
    });
};

exports.fetchArticles = () => {
    return db.query(`
        SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url,
               COUNT(c.comment_id) AS comment_count
        FROM articles AS a
        LEFT JOIN comments AS c ON a.article_id = c.article_id
        GROUP BY a.article_id
        ORDER BY a.created_at DESC;`)

    .then(result => result.rows);
};

exports.fetchArticlesById = (article_id) => {
    return db.query(
        `
        SELECT articles.*, COUNT(comments.comment_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`, [article_id]
    )
    .then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return result.rows[0];
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
    return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
        [article_id]
    )
    .then(result => result.rows);
};