var express = require('express');
var router = express.Router();

var mysql = require('./db_con');
//var connection = mysql.init();
//mysql.test_open(connection);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  

});

module.exports = router;
