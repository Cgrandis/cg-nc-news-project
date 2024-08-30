const db = require('../db/connection');

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
