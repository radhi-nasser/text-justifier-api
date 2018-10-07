const express = require('express');
const router = express.Router();

const apiController = require('../controllers/api.controller');


/* Open API documentation */
router.get('/', apiController.showDocs);

/* Open API documentation */
router.get('/docs', apiController.showDocs);

/* Justify a text */
router.post('/justify', apiController.justifyText);

/* Generate a token for a user */
router.post('/token', apiController.generateToken);


module.exports = router;
