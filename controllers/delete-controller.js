const { removeCommentById } = require('../models/api-delete-model');

exports.deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params;

    removeCommentById(comment_id)
        .then(() => {
            res.status(204).end();
        })
        .catch(err => {
            if (err.message === 'Comment not found') {
                res.status(404).json({ error: err.message });
            } else {
                next(err);
            }
        });
};
