const db = require('../db/connection');


const addCommentByArticleId = (articleId, username, body) => {
    if (!username || !body) {
        return Promise.reject({ status: 400, msg: 'Bad Request: Missing required fields' });
    }

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
        });
};


module.exports = { addCommentByArticleId };
