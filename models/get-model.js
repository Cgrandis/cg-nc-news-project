const db = require('../db/connection');

exports.getAllTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
    });
};

exports.fetchArticles = (sort_by = 'created_at', order = 'desc') => {
    const validColumns = [
        'article_id', 'title', 'topic', 'author', 'created_at', 'votes', 'article_img_url', 'comment_count'
    ];

    // Check if sort_by is valid
    if (!validColumns.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort_by parameter' });
    }

    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const query = `
        SELECT articles.article_id, articles.title, articles.topic, articles.author, 
               articles.created_at, articles.votes, articles.article_img_url, 
               COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${sortOrder};`;

    return db.query(query).then(({ rows }) => rows);
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