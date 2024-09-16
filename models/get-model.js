const db = require('../db/connection');

exports.getAllTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
    });
};

exports.fetchArticles = (topic, sort_by = 'created_at', order = 'desc') => {
    
    const queryValues = [];
    let queryStr = `
        SELECT 
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url, 
            COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
    `;

    if (topic) {
        queryValues.push(topic);
        queryStr += ` WHERE articles.topic = $1`;
    }

    queryStr += `
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order.toUpperCase()};
    `;

    return db.query(queryStr, queryValues).then((result) => {
        
        return result.rows;
    });
};

exports.checkTopicExists = (topic) => {
    return db
        .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
        .then((result) => {
            return result.rows.length > 0;
        });
};


exports.fetchArticlesById = (article_id) => {
    return db.query(
        `
        SELECT articles.*, COUNT(comments.comment_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`, [article_id]
    )
    .then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Article not found' });
        }
        return result.rows[0];
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
    return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
        [article_id]
    )
    .then(result => result.rows);
};

exports.fetchUsers = () => {
    return db.query('SELECT username, name, avatar_url FROM users;')
        .then(({ rows }) => rows);
};