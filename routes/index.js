var express = require('express');
var router = express.Router();
const auth = requre("./auth.json");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
