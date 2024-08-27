const { getAllTopics, getApiEndpoints, getAllArticles, fetchArticlesById } = require('../models/model')

exports.getTopics = (req, res, next) => {
    getAllTopics().then((topics) => {
        res.status(200).send({topics});
    })
}

exports.getApiEndpoints = (req, res) => {
    if (req.query.invalidParam) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }
    res.status(200).send(endpoints);
}

exports.getArticles = (req, res, next) => {
    getAllArticles().then((articles) => {
        res.status(200).send({articles});
    });
};  

exports.getArticlesById = (req, res, next) => {
    const { article_id } = req.params;
    
    fetchArticlesById(article_id).then((article) => {
        
        if (article) {
            res.status(200).send({ article });
        } else {
            res.status(404).send({ msg: 'Article not found'})
        }
    })
    .catch((err) => {
        next(err);
    });    
};