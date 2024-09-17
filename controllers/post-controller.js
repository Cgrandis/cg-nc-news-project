const { addCommentByArticleId } = require('../models/post-model');


exports.addCommentToArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    // Logging to help with debugging
    console.log('Received comment for article:', article_id);
    console.log('Comment details:', { username, body });

    // Validation: Ensure required fields are present
    if (!username || !body) {
        return res.status(400).json({ error: 'Missing required fields: username, body' });
    }

    // Call the model function to add the comment
    addCommentByArticleId(article_id, username, body)
        .then(comment => {
            res.status(201).json({ comment }); // Return the new comment
        })
        .catch(err => {
            console.error('Error in addCommentToArticle:', err); // Log the error for debugging
            if (err.status === 404) {
                res.status(404).json({ error: 'Article not found' });
            } else if (err.status === 400) {
                res.status(400).json({ error: err.msg });
            } else {
                res.status(500).json({ msg: 'Internal Server Error' });
            }
        });
};

