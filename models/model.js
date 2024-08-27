const db = require('../db/connection');

exports.getAllTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
    });
};

exports.getAllArticles = () => {
    return db.query('SELECT * FROM articles;'). then((result) => {
        return result.rows
    });
};
exports.fetchArticlesById = (article_id) => {
    console.log('Fetching article with ID:', article_id);
    return db.query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then((result) => {
        return result.rows[0];
    })
}