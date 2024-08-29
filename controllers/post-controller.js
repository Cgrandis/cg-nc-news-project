const { addCommentByArticleId } = require('../models/post-model');


exports.addCommentToArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    if (!username || !body) {
        return res.status(400).json({ error: 'Missing required fields: username, body' });
    }

    addCommentByArticleId(article_id, username, body)
        .then(comment => {
        
            res.status(201).json({ comment });
        })
        .catch(err => {
            if (err.status === 404) {
            
                res.status(404).json({ error: 'Article not found' });
            } else {
                res.status(500).json({ msg: 'Internal Server Error' }); 
            }
        });
};

