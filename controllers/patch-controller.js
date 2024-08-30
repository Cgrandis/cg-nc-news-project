const { adjustArticleVotes } = require('../models/patch-model');

exports.updateArticleVotes = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    if (typeof inc_votes !== 'number') {
        return res.status(400).json({ error: 'Invalid input for votes' });
    }
    adjustArticleVotes(article_id, inc_votes)
        .then(article => {
            res.status(200).json({ article }); 
        })
        .catch(err => {
            if (err.status === 404) {
                res.status(404).json({ error: 'Article not found' });
            } else {
                
                res.status(500).json({ error: 'Internal server error' }); 
            }
        });
};