const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


require('dotenv').config();

var app = express();

app.use(logger('dev'));

app.use(bodyParser.json({ limit: '50mb' }));

app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
}));

app.use(bodyParser.text({ limit: '50mb' }));

app.use(cookieParser());

app.use('/', require('./routes/index.route'));

mongoose.connect('mongodb://' + process.env.DATABASE_USERNAME + ':' + process.env.DATABASE_PASSWORD + '@' + process.env.DATABASE_HOST + ':' + process.env.DATABASE_PORT + '/' + process.env.DATABASE_NAME, {
    useNewUrlParser: true,
    useCreateIndex: true
}, function(error) {
    if (error) {
        console.log('Error connecting to mongodb:', error);
        process.exit();
    }

    app.use('/api', require('./routes/api.route'));

    console.log('Successful connection to the database');
});

console.log('The server is running');


module.exports = app;
