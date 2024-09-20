const db = require('../db/connection');

exports.adjustArticleVotes = (article_id, inc_votes) => {
    return db.query(`
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;
    `, [inc_votes, article_id])
    .then(result => {
        if (result.rows.length === 0) {
            const error = new Error('Article not found');
            error.status = 404;
            throw error;
        }
        return result.rows[0];
    })
    .then(article => {
        return db.query(`
            SELECT COUNT(comment_id) AS comment_count
            FROM comments
            WHERE article_id = $1;
        `, [article.article_id])
        .then(result => {
            article.comment_count = parseInt(result.rows[0].comment_count, 10);
            return article;
        });
    });
};
