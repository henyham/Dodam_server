var express = require('express');
var router = express.Router();

var mysql = require('./db_con')();
var connection = mysql.init();
mysql.test_open(connection);

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  if(req.query.userId != null){
    var userId = req.query.userId; 
  } else {
    console.log("req error : no userId in parameter")
  }

  connection.query('SELECT * FROM USER WHERE userId=?', [userId], function(err, data){
    if(err){
      console.log(err);
      res.send(err);
    } else {
      console.log("Database result data from /users/exist?userId=" + userId);
      console.log(data);

      if(data != null){ //이미 가입한 유저
        console.log("already joined user " + userId);
        res.send("joinedUser");
      } else {          //새로운 유저
        console.log("new user " + userId);
        res.send("newUser");
      }
      
    }
  });

});

module.exports = router;
