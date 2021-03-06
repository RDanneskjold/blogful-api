const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures')


describe.only('Articles Endpoints', function() {
    let db;

    before('make knex instance', () => {
        db= knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('blogful_articles').truncate())

    afterEach('cleanup', () => db('blogful_articles').truncate())

    describe('GET /articles', () => {
        
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/articles')
                    .expect(200, [])
            })
        })

        context('Given there are articles in the database', () => {
            const testArticles = makeArticlesArray()
            
            beforeEach('insert articles', () => {
                return db
                .into('blogful_articles')
                .insert(testArticles)
            })
            
            it('GET /articles responds with 200 and all of the articles', () => {
                const expectedArticles = testArticles.map(article => {
                    const newDate = article.date_published.toISOString()
                    
                    return article = {
                        ...article,
                        date_published: newDate,
                    }
                })
                
                return supertest(app)
                .get('/articles')
                .expect(200, expectedArticles)
                // .then(actual => {
                    //     expect(actual.body).to.eql(expectedArticles)
                    // }) 
            })
                
        })
    })

    describe('GET /articles/:article_id', () => {
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const articleId = 123456
                return supertest(app)
                    .get(`/articles/${articleId}`)
                    .expect(404, { error: { message: `Article doesn't exist` } })
            })
        })
        
        context('Given there are articles in the database', () => {
            const testArticles = makeArticlesArray()

            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            })

            it('responds with 200 and the specified article', () => {
                const articleId = 2
                const expectedArticle = testArticles[articleId - 1]
                return supertest(app)
                .get(`/articles/${articleId}`)
                .expect(200)
                .then(actual => {
                    // console.log(typeof (actual.body.date_published), typeof (expectedArticle.date_published), (expectedArticle.date_published).toISOString())
                    expect(actual.body).to.eql({
                        ...expectedArticle,
                        date_published: expectedArticle.date_published.toISOString(),
                    })
                })
            })
        })
    })
})
            
        