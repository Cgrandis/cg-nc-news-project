const { getAllTopics, getAllArticles, fetchArticlesById, fetchCommentsByArticleId } = require('../models/model')
const endpoints = require('../endpoints.json')

exports.getTopics = (req, res, next) => {
    getAllTopics().then((topics) => {
        res.status(200).send({topics});
    })
}

exports.getApiEndpoints = (req, res) => {
    if (req.query.invalidParam) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }
    // Check if endpoints data is loaded correctly
    if (!endpoints) {
        return res.status(500).json({ error: 'Failed to load endpoint data' });
    }
    res.status(200).json(endpoints);
};

exports.getArticles = (req, res, next) => {
    getAllArticles().then((articles) => {
        res.status(200).send({articles});
    });
};  

exports.getArticlesById = (req, res, next) => {
    const { article_id } = req.params;
    fetchArticlesById(article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch((err) => {
            if (err.status === 404) {
                res.status(404).send({ msg: err.msg });
            } else {
                next(err);  // For any other kinds of errors, pass them to your global error handler
            }
        });
};

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    if (!Number.isInteger(parseInt(article_id))) {
        return res.status(400).send({ msg: 'Invalid article ID' });
    }

    fetchCommentsByArticleId(article_id)
        .then(comments => {
            if (comments.length === 0) {
                return res.status(404).send({ msg: 'No comments found for this article or article does not exist' });
            }
            res.status(200).send({ comments });
        })
        .catch(err => {
            console.error(err);
            next(err);
        });
};
