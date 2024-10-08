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

    test('200: responds with the article object for a given id, including comment_count', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then((response) => {
                const { body: { article } } = response;
                expect(article).toEqual(expect.objectContaining({
                    article_id: 1,
                    title: expect.any(String),
                    body: expect.any(String),
                    votes: expect.any(Number),
                    topic: expect.any(String),
                    author: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number),
                }));
            
                expect(article.comment_count).toBe(11); 
            });
    });
});

describe('CORE: GET /api/articles', () => {
    test('200: should return all articles', async () => {
        const response = await request(app).get('/api/articles');
        
        expect(response.status).toBe(200);
    
        const articles = response.body.articles;
        expect(articles).toHaveLength(articles.length);
    
    });

    test('200: should return all articles sorted by date in descending order', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then((response) => {
                expect(response.body.articles).toBeInstanceOf(Array);
                if (response.body.articles.length > 1) {
                    const date1 = new Date(response.body.articles[0].created_at).getTime();
                    const date2 = new Date(response.body.articles[1].created_at).getTime();
                    expect(date1).toBeGreaterThanOrEqual(date2);
                }
        })
    
    });

    test('200: should confirm that the first article object contains all required properties', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then((response) => {
            
                const article = response.body.articles[0];
                expect(article).toHaveProperty('author');
                expect(article).toHaveProperty('title');
                expect(article).toHaveProperty('article_id');
                expect(article).toHaveProperty('topic');
                expect(article).toHaveProperty('created_at');
                expect(article).toHaveProperty('votes');
                expect(article).toHaveProperty('article_img_url');
                expect(article).toHaveProperty('comment_count');
                expect(article).not.toHaveProperty('body');
        })
    });

    test('200: sorts articles by date in descending order by default', async () => {
        const response = await request(app).get('/api/articles');
        expect(response.status).toBe(200);
        
        const articles = response.body.articles;
        expect(articles).toHaveLength(articles.length);
    
        // Manually check if articles are sorted by date in descending order using getTime()
        for (let i = 1; i < articles.length; i++) {
            expect(new Date(articles[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(new Date(articles[i].created_at).getTime());
        }
    });

    test('400: responds with an error for invalid sort_by column', async () => {
        const response = await request(app).get('/api/articles?sort_by=not_a_column');
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe('Invalid sort_by parameter');
    });

    test('200: should return articles filtered by the specified topic', async () => {
        const topic = 'mitch';
        const res = await request(app)
            .get(`/api/articles?topic=${topic}`)
            .expect(200);
            
        expect(res.body.articles).toBeInstanceOf(Array);
        expect(res.body.articles.length).toBeGreaterThan(0);
        expect(res.body.articles.every(article => article.topic === topic)).toBe(true);
    });

    test('404: responds with an error when topic does not exist', async () => {
        const nonExistentTopic = 'nonexistenttopic';
        const response = await request(app)
            .get(`/api/articles?topic=${nonExistentTopic}`)
            .expect(404);

        expect(response.body.msg).toBe('Topic not found');
    });

    test('200: responds with an empty array when topic exists but has no articles', async () => {
        const topicWithNoArticles = 'paper';
        const response = await request(app)
            .get(`/api/articles?topic=${topicWithNoArticles}`)
            .expect(200);
        
        expect(response.body.articles).toEqual([]);
    });

    test('400: responds with an error for unsupported query parameters', async () => {
        const response = await request(app)
            .get('/api/articles?unsupportedParam=value')
            .expect(400);

        expect(response.body.msg).toBe('Invalid query parameter');
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
          .get('/api/articles/1/comments') 
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

        
    test('404: should return an error if the article does not exist', async () => {
        const response = await request(app)
            .post(`/api/articles/9999/comments`)
            .send({ username: 'validUser', body: 'Valid comment' })
            .expect(404);

        expect(response.body.error).toBe('Article not found');
    });

    test('400: should return an error if required fields are missing', async () => {
        const articleId = 1; 
        const invalidComment = {};

        const response = await request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(invalidComment)
            .expect(400);

        expect(response.body.error).toBe('Missing required fields: username, body');
    });    
});

describe('CORE: PATCH /api/articles/:article_id:', () => {
    test('200: should update the vote count and return the updated article', () => {
        return request(app)
        .patch('/api/articles/10')
        .send({ inc_votes: 15 })
        .expect(200)
        .then((response) => {
            expect(response.body.article.votes).toBe(15);
        })
    })

    test('400: should return an error for invalid vote input', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: 'ten' })
        .expect(400)
        .then((response) => {
            expect(response.body.error).toBe('Invalid input for votes');
        })             
    });

    test('404: should return an error if the article does not exist', async () => {
        const response = await request(app)
            .patch('/api/articles/9999')
            .send({ inc_votes: 1 })
            .expect(404);
    
        expect(response.body.error).toBe('Article not found');
    });
    
    
});

describe('CORE: DELETE /api/comments/:comment_id', () => {
    test('204: deletes the comment and returns no content', async () => {
        const response = await request(app)
            .delete('/api/comments/1')
            .expect(204);
        expect(response.body).toEqual({});
    });

    test('404: returns not found for non-existent comment id', async () => {
        const response = await request(app)
            .delete('/api/comments/9999')
            .expect(404);
        expect(response.body.error).toBe('Comment not found');
    });
});

describe('CORE: GET /api/users', () => {
    test('200: responds with an array of user objects', async () => {
        const { body } = await request(app)
            .get('/api/users')
            .expect(200);
        
        expect(Array.isArray(body.users)).toBe(true);
        body.users.forEach(user => {
            expect(user).toEqual(expect.objectContaining({
                username: expect.any(String),
                first_name: expect.any(String),
                surname: expect.any(String),   
                email: expect.any(String)      
            }));
        });
    });

    test('500: handles database errors', async () => {

        jest.spyOn(db, 'query').mockRejectedValueOnce(new Error('Bad database connection'));

        const response = await request(app)
            .get('/api/users')
            .expect(500);

        expect(response.body.error).toBe('Internal server error');
        
        db.query.mockRestore();
    });
});

describe('POST /api/users/register', () => {
    test('201: Registers a new user successfully', async () => {
        const response = await request(app)
          .post('/api/users/register')
          .send({
            first_name: 'John',
            surname: 'Doe',
            username: 'newUser',
            email: 'newuser@example.com',
            password: 'securePassword',
          });
    
        expect(response.status).toBe(201);
        expect(response.body.user).toHaveProperty('username', 'newUser');
        expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      });
  
    test('400: Responds with error for missing fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newUser',
        });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });
  
    test('409: Responds with error for duplicate username or email', async () => {
        await db.query(
          'INSERT INTO users (username, first_name, surname, email, password) VALUES ($1, $2, $3, $4, $5)', 
          ['existingUser', 'John', 'Doe', 'existing@example.com', 'hashedPassword']
        );
        
        const response = await request(app)
          .post('/api/users/register')
          .send({
            first_name: 'John',  
            surname: 'Doe',
            username: 'existingUser',
            email: 'existing@example.com',
            password: 'securePassword',
          });
      
        expect(response.status).toBe(409);
        expect(response.body.error).toBe('Username or email already exists');
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
    test('GET /api/articles responds with expected properties', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/articles']).toHaveProperty('description')
            expect(typeof body['GET /api/articles'].description).toBe('string');
            expect(body['GET /api/articles']).toHaveProperty('queries')
            expect(typeof body['GET /api/articles'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/articles'].queries)).toBe(true);
            expect(body['GET /api/articles']).toHaveProperty('exampleResponse')
            expect(typeof body['GET /api/articles'].exampleResponse).toBe('object');
            
        });
    });   

    test('GET /api/articles responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {            
            const exampleResponse = response.body['GET /api/articles'].exampleResponse;

            expect(exampleResponse).toBeDefined()
            expect(typeof exampleResponse).toBe('object')
        
            const { articles } = exampleResponse
        
            expect(Array.isArray(articles)).toBe(true)
            expect(articles.length).toBeGreaterThan(0)         
            articles.forEach(article => {
                expect(article).toEqual(expect.objectContaining({
                    comment_count: expect.any(Number),
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
    })
});

describe('GET /api/articles/:article_id', () => {
    test('GET /api/articles/:article_id responds with expected properties', () => {
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
            expect(body['GET /api/articles/:article_id']).toHaveProperty('exampleResponse')
            expect(typeof body['GET /api/articles/:article_id'].exampleResponse).toBe('object');
        });
    });

    test('GET /api/articles/:article_id responds with its exampleResponse property', () => {
        return request(app)
            .get('/api') 
            .expect(200)
            .then((response) => {    
                const exampleResponse = response.body['GET /api/articles/:article_id'].exampleResponse;
    
                expect(exampleResponse).toBeDefined();
                expect(typeof exampleResponse).toBe('object');
            
                expect(exampleResponse).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number)
            }));
        }); 
    });
});

describe('GET /api/articles/:article_id/comments', () => {
    test('GET /api/articles/:article_id/comments responds with expected properties', () => {
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
            expect(body['GET /api/articles/:article_id/comments']).toHaveProperty('exampleResponse')
            expect(typeof body['GET /api/articles/:article_id/comments'].exampleResponse).toBe('object');
        });
    });   

    test('GET /api/articles/:article_id/comments responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const exampleResponse = response.body['GET /api/articles/:article_id/comments'].exampleResponse;

            expect(exampleResponse).toBeDefined()
            expect(typeof exampleResponse).toBe('object')
        
            const { comments } = exampleResponse

            expect(Array.isArray(comments)).toBe(true)
            expect(comments.length).toBeGreaterThan(0)
        
            comments.forEach(comment => {
                expect(comment).toEqual(expect.objectContaining({
                    comment_id: expect.any(Number),
                    body: expect.any(String),
                    votes: expect.any(Number),
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    created_at: expect.any(String),
                }));
            });
        });
    })
});

describe('POST /api/articles/:article_id/comments', () => {
    test('POST /api/articles/:article_id/comments responds with expected properties', () => {
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
            expect(body['POST /api/articles/:article_id/comments']).toHaveProperty('exampleResponse')
            expect(typeof body['POST /api/articles/:article_id/comments'].exampleResponse).toBe('object');
        });
    });   

    test('POST /api/articles/:article_id/comments responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const exampleResponse = response.body['POST /api/articles/:article_id/comments'].exampleResponse;

            expect(exampleResponse).toBeDefined()
            expect(typeof exampleResponse).toBe('object')
        
            const { comment } = exampleResponse

            expect(Array.isArray(comment)).toBe(true)
            expect(comment.length).toBeGreaterThan(0)
        
            comment.forEach(commentKeys => {
                expect(commentKeys).toEqual(expect.objectContaining({
                    comment_id: expect.any(Number),
                    body: expect.any(String),
                    votes: expect.any(Number),
                    article_id: expect.any(Number),
                    author: expect.any(String),
                    created_at: expect.any(String),
                }));
            });
        });
    })
});

describe('PATCH /api/articles/:article_id', () => { 
    test('PATCH /api/articles/:article_id responds with expected properties', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['PATCH /api/articles/:article_id']).toHaveProperty('description')
            expect(typeof body['GET /api/articles/:article_id'].description).toBe('string');
            expect(body['PATCH /api/articles/:article_id']).toHaveProperty('queries')
            expect(typeof body['GET /api/articles/:article_id'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/articles/:article_id'].queries)).toBe(true);
            expect(body['PATCH /api/articles/:article_id']).toHaveProperty('exampleResponse')
            expect(typeof body['PATCH /api/articles/:article_id'].exampleResponse).toBe('object');
        });
    });   

    test('PATCH /api/articles/:article_id responds with its exampleResponse property', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then((response) => {    
                const exampleResponse = response.body['PATCH /api/articles/:article_id'].exampleResponse;
    
                expect(exampleResponse).toBeDefined();
                expect(typeof exampleResponse).toBe('object');
            
                expect(exampleResponse).toEqual(expect.objectContaining({
                    article_id: expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(Number)
            }));
        });  
    });
});

describe('DELETE /api/comments/:comment_id', () => {
    test('DELETE /api/comments/:comment_id responds with expected properties', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['DELETE /api/comments/:comment_id']).toHaveProperty('description')
            expect(typeof body['DELETE /api/comments/:comment_id'].description).toBe('string');
            expect(body['DELETE /api/comments/:comment_id']).toHaveProperty('queries')
            expect(typeof body['DELETE /api/comments/:comment_id'].queries).toBe('object');
            expect(Array.isArray(body['DELETE /api/comments/:comment_id'].queries)).toBe(true);
            expect(body['DELETE /api/comments/:comment_id']).toHaveProperty('exampleResponse')
            expect(typeof body['DELETE /api/comments/:comment_id'].exampleResponse).toBe('object');
            
        });
    });   
});

describe('GET /api/users', () => {
    test('GET /api/users responds with expected properties', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {    
            const { body } = response
            expect(body['GET /api/users']).toHaveProperty('description')
            expect(typeof body['GET /api/users'].description).toBe('string');
            expect(body['GET /api/users']).toHaveProperty('queries')
            expect(typeof body['GET /api/users'].queries).toBe('object');
            expect(Array.isArray(body['GET /api/users'].queries)).toBe(true);
            expect(body['GET /api/users']).toHaveProperty('exampleResponse')
            expect(typeof body['GET /api/users'].exampleResponse).toBe('object');
            
        });
    });   

    test('GET /api/users responds with it`s exampleResponse property', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {            
            const exampleResponse = response.body['GET /api/users'].exampleResponse;

            expect(exampleResponse).toBeDefined()
            expect(typeof exampleResponse).toBe('object')
        
            const { users } = exampleResponse
        
            expect(Array.isArray(users)).toBe(true)
            expect(users.length).toBeGreaterThan(0)         
            users.forEach(user => {
                expect(user).toEqual(expect.objectContaining({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String),
                }));
            });       
        });
    })
});

describe('POST /api/users/register', () => {
    test('POST /api/users/register responds with expected properties', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then((response) => {    
                const { body } = response;
                expect(body['POST /api/users/register']).toHaveProperty('description');
                expect(typeof body['POST /api/users/register'].description).toBe('string');
                expect(body['POST /api/users/register']).toHaveProperty('queries');
                expect(Array.isArray(body['POST /api/users/register'].queries)).toBe(true);
                expect(body['POST /api/users/register']).toHaveProperty('exampleRequest');
                expect(typeof body['POST /api/users/register'].exampleRequest).toBe('object');
                expect(body['POST /api/users/register']).toHaveProperty('exampleResponse');
                expect(typeof body['POST /api/users/register'].exampleResponse).toBe('object');
            });
    });

    test('POST /api/users/register responds with its exampleResponse property', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then((response) => {            
                const exampleResponse = response.body['POST /api/users/register'].exampleResponse;

                expect(exampleResponse).toBeDefined();
                expect(typeof exampleResponse).toBe('object');
                
                const { user } = exampleResponse;
                
                expect(user).toEqual(expect.objectContaining({
                    username: expect.any(String),
                    first_name: expect.any(String),
                    surname: expect.any(String),
                    email: expect.any(String),
                    created_at: expect.any(String) 
            }));
        });
    });
});



