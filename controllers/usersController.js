const { fetchUsers } = require('../models/userModel')

exports.getUsers = (req, res, next) => {
    fetchUsers()
        .then(users => {
            res.status(200).json({ users });
        })
        .catch(err => {            
            res.status(500).json({ error: 'Internal server error' });
        });
};