const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

var app = express();

app.use(logger('dev'));

app.use(express.json());

app.use(express.urlencoded({
    extended: false
}));

app.use(bodyParser.text());

app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api', apiRouter);

module.exports = app;