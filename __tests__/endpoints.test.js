const app = require('../app');
const request = require('supertest');
const seed = require('../db/seeds/seed');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');

beforeEach(() => seed((data)));
afterAll(() => db.end());

describe('CORE: GET/api/topics: ', () => {
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

describe('CORE: GET/api/articles/:article_id', () => {
    test('200: responds with the article object for a given id', () => {
        return request(app)
            .get('/api/articles/1')
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
                    comment_count: expect.anything(Number),
                }));
            });
    });

    test('404: responds with an error message when article_id does not exist', () => {
        return request(app)
            .get('/api/articles/9999')
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

describe('CORE: GET /api/articles/:article_id/comments', () => {
    test('200: returns an array of comments for a valid article_id', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.comments)).toBe(true);
                expect(body.comments).toHaveLength(11);
                expect(body.comments[0]).toHaveProperty('comment_id');
                expect(body.comments[0]).toHaveProperty('votes');
                expect(body.comments[0]).toHaveProperty('body');
                expect(body.comments[0]).toHaveProperty('article_id');
                expect(body.comments[0]).toHaveProperty('author');
                expect(body.comments[0]).toHaveProperty('created_at');
            });
    });

    test('200: responds with the comment object expectation', () => {
        return request(app)
          .get('/api/articles/1/comments')  // Assuming '1' is a valid article_id
          .expect(200)
          .then(({ body }) => {
            body.comments.forEach(comment => {
              expect(comment).toEqual(expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                body: expect.any(String),
                author: expect.any(String),
                article_id: expect.any(Number),
                created_at: expect.any(String)
              }));
            });
        });
      });
      

    test('404: returns an error for a non-existent article_id', () => {
        return request(app)
            .get('/api/articles/9999/comments')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('No comments found for this article or article does not exist');
        });
    });

    test('400: returns an error for an invalid article_id', () => {
        return request(app)
            .get('/api/articles/not-a-number/comments')
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Invalid article ID');
        });
    });
});

describe('CORE: POST /api/articles/:article_id/comments', () => {
    test('201: should add a new comment and return it', async () => {
        const articleId = 1; 
        const newComment = {
            username: 'rogersop',
            body: 'This is a test comment.'
        };

        return request(app)
        .post(`/api/articles/${articleId}/comments`)
        .send(newComment)
        .expect(201)
        .then((response) => {
            
            expect(response.body.comment).toEqual(
                expect.objectContaining({
                    article_id: articleId,
                    author: newComment.username,
                    body: newComment.body
                })
            );
        });   
    });     

        // Test for non-existent article
    test('404: should return an error if the article does not exist', async () => {
        const response = await request(app)
            .post(`/api/articles/9999/comments`)  // Using a non-existent article ID
            .send({ username: 'validUser', body: 'Valid comment' })
            .expect(404);

        expect(response.body.error).toBe('Article not found');
    });

    // Test for missing fields
    test('400: should return an error if required fields are missing', async () => {
        const articleId = 1; // Assuming 1 is a valid article ID in your test setup
        const invalidComment = {}; // Missing username and body

        const response = await request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(invalidComment)
            .expect(400);

        expect(response.body.error).toBe('Missing required fields: username, body');
    });

    
});

//endpoints tests starts here
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

describe('GET /api/articles', () => {
    test('GET /api/articles responds with description and querie property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/articles']).toHaveProperty('description')
            expect(typeof body['GET /api/articles'].description).toBe('string');
            expect(body['GET /api/topics']).toHaveProperty('queries')
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
            expect(article).toHaveProperty('topic');
            expect(article).toHaveProperty('author');
            expect(article).toHaveProperty('body');
            expect(article).toHaveProperty('created_at');
            expect(article).toHaveProperty('votes');
            expect(article).toHaveProperty('comment_count');
            expect(typeof article.title).toBe('string');
            expect(typeof article.topic).toBe('string');
            expect(typeof article.author).toBe('string');
            expect(typeof article.body).toBe('string');
            expect(typeof article.created_at).toBe('string');
            expect(typeof article.votes).toBe('number');
            expect(typeof article.comment_count).toBe('number');
            });
        });
    })
});

describe('GET /api/articles/:article_id', () => {
    test('GET /api/articles/:article_id responds with description and querie property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/articles/:article_id']).toHaveProperty('description')
            expect(typeof body['GET /api/articles/:article_id'].description).toBe('string');
            expect(body['GET /api/articles/:article_id']).toHaveProperty('queries')
            expect(typeof body['GET /api/articles/:article_id'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/articles/:article_id'].queries)).toBe(true);
        });
    });   

    test('GET /api/articles/:article_id responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            const exampleResponse = body['GET /api/articles/:article_id'].exampleResponse;

            expect(exampleResponse).toBeDefined();
            expect(typeof exampleResponse).toBe('object');
    
            expect(exampleResponse).toHaveProperty('article_id', 1);
            expect(exampleResponse).toHaveProperty('title');
            expect(typeof exampleResponse.title).toBe('string');
            expect(exampleResponse).toHaveProperty('topic');
            expect(typeof exampleResponse.topic).toBe('string');
            expect(exampleResponse).toHaveProperty('author');
            expect(typeof exampleResponse.author).toBe('string');
            expect(exampleResponse).toHaveProperty('body');
            expect(typeof exampleResponse.body).toBe('string');
            expect(exampleResponse).toHaveProperty('created_at');
            expect(typeof exampleResponse.created_at).toBe('string');
            expect(exampleResponse).toHaveProperty('votes', 100);
            expect(exampleResponse).toHaveProperty('article_img_url');
            expect(typeof exampleResponse.article_img_url).toBe('string');
            expect(exampleResponse).toHaveProperty('comment_count', 11);
        });
    });
});

describe('GET /api/articles/:article_id/comments', () => {
    test('GET /api/articles/:article_id/comments responds with description and querie property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/articles/:article_id/comments']).toHaveProperty('description')
            expect(typeof body['GET /api/articles/:article_id/comments'].description).toBe('string');
            expect(body['GET /api/articles/:article_id/comments']).toHaveProperty('queries')
            expect(typeof body['GET /api/articles/:article_id/comments'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/articles/:article_id/comments'].queries)).toBe(true);
        });
    });   

    test('GET /api/articles/:article_id/comments responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            const exampleResponse = body['GET /api/articles/:article_id/comments'].exampleResponse
        expect(exampleResponse).toHaveProperty('comments');
        expect(Array.isArray(exampleResponse.comments)).toBe(true);

        exampleResponse.comments.forEach(comment => {
            expect(comment).toHaveProperty('comment_id');
            expect(comment).toHaveProperty('article_id');
            expect(comment).toHaveProperty('author');
            expect(comment).toHaveProperty('body');
            expect(comment).toHaveProperty('created_at');
            expect(comment).toHaveProperty('votes');
            expect(typeof comment.comment_id).toBe('number');
            expect(typeof comment.article_id).toBe('number');
            expect(typeof comment.author).toBe('string');
            expect(typeof comment.body).toBe('string');
            expect(typeof comment.created_at).toBe('string');
            expect(typeof comment.votes).toBe('number');
            });
        });
    })
});

describe('POST /api/articles/:article_id/comments', () => {
    test('POST /api/articles/:article_id/comments responds with description and querie property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['POST /api/articles/:article_id/comments']).toHaveProperty('description')
            expect(typeof body['POST /api/articles/:article_id/comments'].description).toBe('string');
            expect(body['POST /api/articles/:article_id/comments']).toHaveProperty('queries')
            expect(typeof body['POST /api/articles/:article_id/comments'].queries).toBe('object');
            expect(Array.isArray(body['POST /api/articles/:article_id/comments'].queries)).toBe(true);
        });
    });   

    test('POST /api/articles/:article_id/comments responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            const exampleResponse = body['POST /api/articles/:article_id/comments'].exampleResponse
        
            expect(exampleResponse).toHaveProperty('comment');
        expect(Array.isArray(exampleResponse.comment)).toBe(true);

        exampleResponse.comment.forEach(commentKeys => {
            expect(commentKeys).toHaveProperty('comment_id');
            expect(commentKeys).toHaveProperty('article_id');
            expect(commentKeys).toHaveProperty('author');
            expect(commentKeys).toHaveProperty('body');
            expect(commentKeys).toHaveProperty('created_at');
            expect(commentKeys).toHaveProperty('votes');
            expect(typeof commentKeys.comment_id).toBe('number');
            expect(typeof commentKeys.article_id).toBe('number');
            expect(typeof commentKeys.author).toBe('string');
            expect(typeof commentKeys.body).toBe('string');
            expect(typeof commentKeys.created_at).toBe('string');
            expect(typeof commentKeys.votes).toBe('number');
            });
        });
    })
});
