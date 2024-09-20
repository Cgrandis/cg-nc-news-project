const { getAllTopics } = require('../models/topicModels')

exports.getTopics = (req, res, next) => {
    getAllTopics().then((topics) => {
        res.status(200).send({ topics });
    }).catch(next);
};
