const { fetchUsers, createUser } = require('../models/userModel');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

exports.getUsers = (req, res, next) => {
    fetchUsers()
        .then(users => {
            res.status(200).json({ users });
        })
        .catch(err => {            
            res.status(500).json({ error: 'Internal server error' });
        });
};

exports.registerUser = async (req, res, next) => {
    const { first_name, surname, username, email, password } = req.body;
    console.log(req.body)
    // Check if required fields are present
    if (!first_name || !surname || !username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      const user = await createUser(first_name, surname, username, email, hashedPassword);
      console.log(user, 'the user')
      res.status(201).json({ user });
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        res.status(409).json({ error: 'Username or email already exists' });
      } else {
        next(err);
      }
    }
  };
