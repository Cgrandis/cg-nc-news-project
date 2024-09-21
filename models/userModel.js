const db = require('../db/connection');

exports.fetchUsers = () => {
    return db.query('SELECT first_name, surname, username, email FROM users;')
        .then(({ rows }) => rows);
};

exports.createUser = (first_name, surname, username, email, password) => {
    const query = `
      INSERT INTO users (first_name, surname, username, email, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [first_name, surname, username, email, password];
    console.log(values)
    return db.query(query, values).then(({ rows }) => rows[0]);
    
  };