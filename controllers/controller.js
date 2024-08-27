const { getAllTopics, getApiEndpoints } = require('../models/model')

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