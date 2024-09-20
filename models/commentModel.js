const db = require('../db/connection');

exports.fetchCommentsByArticleId = (article_id) => {
    return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
        [article_id]
    )
    .then(result => result.rows);
};

exports.addCommentByArticleId = (articleId, username, body) => {

    return db
        .query(`SELECT * FROM articles WHERE article_id = $1;`, [articleId])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'Article not found' });
            }
            return db.query(
                `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`,
                [articleId, username, body]
            );
        })
        .then((result) => {
            
            return result.rows[0];
        })
        .catch((error) => {
            console.error('Database error:', error); 
            throw error; 
        });
    };

exports.removeCommentById = (comment_id) => {
    return db.query(`
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;
    `, [comment_id])
    .then(result => {
        if (result.rows.length === 0) {
            const error = new Error('Comment not found');
            error.status = 404;
            throw error;
        }
    });
};