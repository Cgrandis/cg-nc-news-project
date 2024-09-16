const { getAllTopics, fetchArticles, fetchArticlesById, fetchCommentsByArticleId, fetchUsers, checkTopicExists } = require('../models/get-model')


exports.getTopics = (req, res, next) => {
    getAllTopics().then((topics) => {
        res.status(200).send({topics});
    })
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query;

    // Define valid query parameters
    const validQueries = ['topic', 'sort_by', 'order'];

    // Get an array of keys provided in req.query
    const queryKeys = Object.keys(req.query);

    // Check for unsupported query parameters
    const invalidQueries = queryKeys.filter(key => !validQueries.includes(key));

    if (invalidQueries.length > 0) {
        return res.status(400).send({ msg: 'Invalid query parameter' });
    }

    // Define valid sort_by columns
    const validSortByColumns = [
        'author', 
        'title', 
        'article_id', 
        'topic', 
        'created_at', 
        'votes', 
        'article_img_url', 
        'comment_count'
    ];

    // Validate sort_by parameter
    if (sort_by && !validSortByColumns.includes(sort_by)) {
        return res.status(400).send({ msg: 'Invalid sort_by parameter' });
    }

    // Validate order parameter
    if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
        return res.status(400).send({ msg: 'Invalid order parameter' });
    }

    // Validate topic parameter
    if (topic && typeof topic !== 'string') {
        return res.status(400).send({ msg: 'Invalid topic parameter' });
    }

    // Fetch articles using the validated query parameters
    fetchArticles(topic, sort_by, order)
        .then((articles) => {
            if (articles.length === 0) {
                // Handle case when no articles are found
                if (topic) {
                    return checkTopicExists(topic)
                        .then((exists) => {
                            if (!exists) {
                                return res.status(404).send({ msg: 'Topic not found' });
                            } else {
                                res.status(200).send({ articles: [] });
                            }
                        })
                        .catch(next);
                } else {
                    res.status(200).send({ articles });
                }
            } else {
                res.status(200).send({ articles });
            }
        })
        .catch(next);
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
                next(err);  
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

exports.getUsers = (req, res, next) => {
    fetchUsers()
        .then(users => {
            res.status(200).json({ users });
        })
        .catch(err => {            
            res.status(500).json({ error: 'Internal server error' });
        });
};