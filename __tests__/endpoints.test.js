const app = require('../app');
const request = require('supertest');
const seed = require('../db/seeds/seed');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');

beforeEach(() => seed((data)));
afterAll(() => db.end());

describe('/api/topics: ', () => {
    test('200: responds with an array of topics objects', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            const { body: {topics} } = response
            expect(Array.isArray(topics)).toBe(true)
            expect(response.body.topics.length).toBe(3);
        });
    }) ;
    test('200: responds with expected property and no empty fields', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            const { body: {topics} } = response
            topics.forEach((topic) => {
            expect(topic).toHaveProperty('slug');
            expect(topic).toHaveProperty('description');
            expect(topic.slug).not.toBe('');
            expect(topic.description).not.toBe('');
            });
        });
    });
    test('200: responds with not null fields', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            const { body: {topics} } = response
            topics.forEach((topic) => {
            expect(topic.slug).not.toBeNull();
            expect(topic.description).not.toBeNull();
            });
        });
    });
    test('200: reponds with string values', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            const { body: {topics} } = response
            topics.forEach((topic) => {
            expect(typeof topic.slug).toBe('string');
            expect(typeof topic.description).toBe('string');
            });
        });
    });
});

describe('/api endpoints: ', () => {
    test('GET 200: responds with endpoints.json doc', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {
            const { body } = response
            expect(body).toEqual(expect.any(Object))
        });
    });
    test('GET 200: responds with endpoints property on it', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {
            const { body } = response
            expect(body).toHaveProperty('GET /api');
            expect(body).toHaveProperty('GET /api/topics');
            expect(body).toHaveProperty('GET /api/articles');
        });
    });
});

describe('200: GET /api', () => {
    test('GET /api responds with it`s property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api']).toHaveProperty('description')    
            expect(typeof body['GET /api'].description).toBe('string');
        });
    });
});

describe('200: GET /api - GET /api/topics', () => {
    test('GET /api/topics responds with it`s proprty description', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/topics']).toHaveProperty('description')
            expect(typeof body['GET /api/topics'].description).toBe('string');
        });
    });

    test('GET /api/topics responds with it`s queries property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response

            expect(body['GET /api/topics']).toHaveProperty('queries')
            expect(typeof body['GET /api/topics'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/topics'].queries)).toBe(true);
        });
    });

    test('GET /api/topics responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            const exampleResponse = body['GET /api/topics'].exampleResponse
        expect(exampleResponse).toHaveProperty('topics');
        expect(Array.isArray(exampleResponse.topics)).toBe(true);

        exampleResponse.topics.forEach(topic => {
            expect(topic).toHaveProperty('slug');
            expect(topic).toHaveProperty('description');
            expect(typeof topic.slug).toBe('string');
            expect(typeof topic.description).toBe('string');
            });
        });
    })
});

describe('200: GET /api - GET /api/articles', () => {
    test('GET /api/articles responds with it`s proprty description', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/articles']).toHaveProperty('description')
            expect(typeof body['GET /api/articles'].description).toBe('string');
        });
    });

    test('GET /api/articles responds with it`s queries property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response

            expect(body['GET /api/articles']).toHaveProperty('queries')
            expect(typeof body['GET /api/articles'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/articles'].queries)).toBe(true);
        });
    });

    test('GET /api/articles responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            const exampleResponse = body['GET /api/articles'].exampleResponse
            expect(exampleResponse).toHaveProperty('articles');
            expect(Array.isArray(exampleResponse.articles)).toBe(true);
        
        exampleResponse.articles.forEach(article => {
            expect(article).toHaveProperty('title');
            expect(typeof article.title).toBe('string');
            expect(article).toHaveProperty('topic');
            expect(typeof article.topic).toBe('string');
            expect(article).toHaveProperty('author');
            expect(typeof article.author).toBe('string');
            expect(article).toHaveProperty('body');
            expect(typeof article.body).toBe('string');
            expect(article).toHaveProperty('created_at');
            expect(typeof article.created_at).toBe('string');
            expect(article).toHaveProperty('votes');
            expect(typeof article.votes).toBe('number');
            expect(article).toHaveProperty('comment_count');
            expect(typeof article.comment_count).toBe('number');
            });
        });
    })
});

describe('GET /api error handling', () => {
    test('responds with 400 for invalid query parameters', async () => {
        const response = await request(app)
            .get('/api')
            .query({ invalidParam: 'true' }) // Assuming 'invalidParam' is not supported
            .expect(400);
        
        expect(response.body.error).toBe('Invalid query parameters');
    });
});

describe('GET /api/articles: ', () => {
    test('GET 200: responds displaying all articles in the database', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((response) => {
            const { body: { articles } } = response
            expect(Array.isArray(articles)).toBe(true)
            expect(response.body.articles.length).toBe(13);
            
        });
    });

    test('200: responds with expected property and no empty fields', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((response) => {
            const { body: {articles} } = response
            articles.forEach((article) => {
            expect(article).toHaveProperty('title');
            expect(article.title).not.toBe('');
            expect(article).toHaveProperty('topic');
            expect(article.topic).not.toBe('');
            expect(article).toHaveProperty('author');
            expect(article.author).not.toBe('');
            expect(article).toHaveProperty('body');
            expect(article.body).not.toBe('');
            expect(article).toHaveProperty('created_at');
            expect(article.created_at).not.toBe('');
            expect(article).toHaveProperty('votes');
            expect(article.votes).not.toBe('');
            expect(article).toHaveProperty('article_img_url');
            expect(article.article_img_url).not.toBe('');
            });
        });
    });
    test('200: responds with not null fields', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((response) => {
            const { body: {articles} } = response
            articles.forEach((article) => {
            expect(article.title).not.toBeNull();
            expect(article.topic).not.toBeNull();
            expect(article.author).not.toBeNull();
            expect(article.body).not.toBeNull();
            expect(article.created_at).not.toBeNull();
            expect(article.votes).not.toBeNull();
            expect(article.article_img_url).not.toBeNull();
            });
        });
    });
    test('200: reponds with string values', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((response) => {
            const { body: {articles} } = response
            articles.forEach((article) => {
        
            expect(typeof article.title).toBe('string');
            expect(typeof article.topic).toBe('string');
            expect(typeof article.author).toBe('string');
            expect(typeof article.body).toBe('string');
            expect(typeof article.created_at).toBe('string');
            expect(typeof article.votes).toBe('number');
            expect(typeof article.article_img_url).toBe('string');
            });
        });
    });
});

describe.only('/api/articles/:article_id', () => {
    test('200: responds with the article object for a valid article_id', () => {
        return request(app)
            .get('/api/articles/1')  // Replace '1' with an existing article_id in your database
            .expect(200)
            .then((response) => {
                const { body: { article } } = response;
                expect(article).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    body: expect.any(String),
                    votes: expect.any(Number),
                    topic: expect.any(String),
                    author: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.any(String),
                }));
            });
    });

    test('404: responds with an error message when article_id does not exist', () => {
        return request(app)
            .get('/api/articles/9999')  // Assuming 9999 is a non-existent article_id
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('Article not found');
            });
    });

    test('400: responds with an error message when article_id is invalid', () => {
        return request(app)
            .get('/api/articles/not-a-valid-id')
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe('Invalid article_id');
            });
    });
}); 
