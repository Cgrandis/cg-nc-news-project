const endpoints = require('../endpoints.json')

exports.getApiEndpoints = (req, res) => {
    if (req.query.invalidParam) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }
    // Check if endpoints data is loaded correctly
    if (!endpoints) {
        return res.status(500).json({ error: 'Failed to load endpoint data' });
    }
    
    res.status(200).json(endpoints)
};