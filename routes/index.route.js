const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Welcome !!!');
});


module.exports = router;
