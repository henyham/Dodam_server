var express = require('express');
var session = require('./passport.js');
var router = express.Router();

var mysql = require('./db_con')();
var connection = mysql.init();
mysql.test_open(connection);

/* GET home page. */
router.get('/', function(req, res, next) {

  var userId = 'tset_userId';
/*  if(req.session.passport) {
    userId = req.session.passport.user.userId;
    console.log('req.session.passport.user = ' + req.session.passport.user);
  } else
    console.log('no user');
*/

  var obj = {
	test: 'hello'
}
  res.send('hello test!');
       // var stmt = 'select * from USER';
        /*connection.query(stmt, function (err, result){
                if (err) {
                        console.log(err);
                } else {
                        console.log("db connection success!!");
                }
        })*/
});


module.exports = router;
/*
module.exports = function(app){//함수로 만들어 객체 app을 전달받음
	var express = require('express');
	var router = express.Router();
	router.get('/test', function(req, res){
		res.send('Hello /test');		
	});
	return router;	//라우터를 리턴
};
*/
