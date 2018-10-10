const express = require('express');
const router = express.Router();

const apiController = require('../controllers/api.controller');


/**
 * @api {post} /api/justify Justify a given text
 * @apiName justify
 * @apiGroup API
 * @apiPermission Bearer Authentication
 * @apiSampleRequest off
 *
 * @apiHeader Authorization Bearer Authentication
 * @apiHeader Content-Type The input format (text/plain)
 *
 * @apiSuccess Text The justified text
 * @apiError Error The error message (PaymentRequired | NoCredentialsSent | WrongCredentialsFormat | WrongCredentials)
 */
router.post('/justify', apiController.justifyText);


/**
 * @api {post} /api/token Generate/Get token of a user
 * @apiName token
 * @apiGroup API
 * @apiSampleRequest off
 *
 * @apiParam Email The user email
 * @apiSuccess Token The user token
 * @apiError Error The error message (Only email field needed, Please Supply a valid email address, Please Supply an email address)
 */
router.post('/token', apiController.generateToken);


module.exports = router;
