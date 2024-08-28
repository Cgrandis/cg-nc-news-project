const db = require('../db/connection');

exports.getAllTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
    });
};

exports.getAllArticles = () => {
    return db.query('SELECT * FROM articles;'). then((result) => {
        return result.rows
    });
};
exports.fetchArticlesById = (article_id) => {
    return db.query(
        `
        SELECT articles.*, COUNT(comments.comment_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;
        `,
        [article_id]
    )
    .then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return result.rows[0]; // Return the article with the comment count as an integer
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
    return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
        [article_id]
    )
    .then(result => result.rows);
};