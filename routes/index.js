var express = require('express');
var session = require('./passport.js');
var router = express.Router();

var mysql = require('./db_con')();
var connection = mysql.init();
mysql.test_open(connection);

/* GET home page. */
router.get('/', function(req, res, next) {

  var userId = '';
  if(req.session.passport) {
    userId = req.session.passport.user.userId;
    console.log('req.session.passport.user = ' + req.session.passport.user);
  } else 
    console.log('no user');
  
  res.render('index', {userId});
	var stmt = 'select * from User';
	connection.query(stmt, function (err, result){
		if (err) {
			console.log(err);
		} else {
			console.log("db connection success!!");
		}
	})
});


module.exports = router;
