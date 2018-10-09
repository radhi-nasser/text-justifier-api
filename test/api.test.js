const request = require('supertest');
const mongoose = require('mongoose');
const expect = require('expect');
const { ObjectId } = require('mongodb');

const app = require('../app');
const User = require('../models/user.model');


require('dotenv').config();


// connect to mongodb
before((done) => {

    mongoose.connect('mongodb://' + process.env.DATABASE_USERNAME + ':' + process.env.DATABASE_PASSWORD + '@' + process.env.DATABASE_HOST + ':' + process.env.DATABASE_PORT + '/' + process.env.DATABASE_NAME, {
        useNewUrlParser: true,
        useCreateIndex: true
    }, done);
});


// clear data and create new one
before((done) => {

    let quotas = {};
    quotas[new Date().toJSON().slice(0, 10)] = 79999;

    const users = [{
        _id: new ObjectId(),
        email: 'radhinasser@gmail.com',
        token: '7f8c3696-e9bf-327e-8b81-eefdaef510d3'
    }, {
        _id: new ObjectId(),
        email: 'radhinasser1@gmail.com',
        token: 'eeefb20b-56b4-3491-a491-8c3b1aa21e7d',
        quotas: quotas
    }];

    User.deleteMany({}).then(() => {
        return User.insertMany(users);
    }).then(() => done());
});


// execute tests for: POST /api/token
describe('POST /api/token', () => {

    // test 1
    it('get token for radhinasser@gmail.com', (done) => {

        request(app)
            .post('/api/token')
            .send({ email: 'radhinasser@gmail.com' })
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('token', '7f8c3696-e9bf-327e-8b81-eefdaef510d3');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    // test 2
    it('should create token for radhinasser2@gmail.com', (done) => {

        request(app)
            .post('/api/token')
            .send({ email: 'radhinasser2@gmail.com' })
            .expect(200)
            .expect((res) => {
                expect(res.body).toHaveProperty('token', 'acc85bba-3b69-33c4-a53e-3a482b5ba2ef');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.find({ email: 'radhinasser2@gmail.com' }).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    });

    // test 3
    it('should detect "radhinasser" is not an email', (done) => {

        request(app)
            .post('/api/token')
            .send({ email: 'radhinasser' })
            .expect(400)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'Please Supply a valid email address');

            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    // test 4
    it('should detect empty email passed', (done) => {

        request(app)
            .post('/api/token')
            .send({ email: '' })
            .expect(400)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'Please Supply an email address');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    // test 5
    it('should detect email was not passed', (done) => {

        request(app)
            .post('/api/token')
            .send({ emaill: '' })
            .expect(400)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'Only email field needed.');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

});


// execute tests for: POST /api/justify
describe('POST /api/justify', () => {

    // test 1
    it('should not justify the passed text and return 402 payment not required error', (done) => {

        let token = 'eeefb20b-56b4-3491-a491-8c3b1aa21e7d';

        request(app)
            .post('/api/justify')
            .set('Content-Type', 'text/plain')
            .set('Authorization', 'Bearer ' + token)
            .send('Test todo text Test')
            .expect(402)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'Payment Required.');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                done();
            });
    });

    // test 2
    it('should justify the passed text and the quota of today to be 25', (done) => {

        let token = '7f8c3696-e9bf-327e-8b81-eefdaef510d3';

        request(app)
            .post('/api/justify')
            .set('Content-Type', 'text/plain')
            .set('Authorization', 'Bearer ' + token)
            .send(`Test todo text Test todo text Test todo text Test todo text Test todo text Test todo text
Test todo text Test todo text `)
            .expect(200)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect((res) => {
                expect(res.text).toBe(`Test  todo text Test todo text Test todo text Test todo text Test todo text Test
todo text
Test todo text Test todo text`);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.find({ token: token }).then((users) => {
                    expect(users.length).toBe(1);
                    expect(users[0].quotas[new Date().toJSON().slice(0, 10)]).toBe(25);
                    done();
                }).catch((e) => done(e));
            });
    });

    // test 3
    it('should detect wrong token', (done) => {

        request(app)
            .post('/api/justify')
            .set('Content-Type', 'text/plain')
            .set('Authorization', 'Bearer lorum ipsum')
            .send('test')
            .expect(401)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'Wrong credentials.');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                done();
            });
    });

    // test 4
    it('should detect wrong token format', (done) => {

        request(app)
            .post('/api/justify')
            .set('Content-Type', 'text/plain')
            .set('Authorization', 'lorum ipsum')
            .send('test')
            .expect(400)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'Wrong credentials format.');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                done();
            });
    });

    // test 4
    it('should detect missing credentials', (done) => {

        request(app)
            .post('/api/justify')
            .set('Content-Type', 'text/plain')
            .send('test')
            .expect(401)
            .expect((res) => {
                expect(res.body).toHaveProperty('error', 'No credentials sent.');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                done();
            });
    });

});


after(function(done) {

    done();
    process.exit(0);
});
