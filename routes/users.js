var express = require('express');
var router = express.Router();

var mysql = require('./db_con')();
var connection = mysql.init();
mysql.test_open(connection);

/* GET users listing. */
router.get('/exist', function(req, res, next) {

  //결과 값을 담을 object
  var result = {};

  //parameter에 userId 값이 정상적으로 있는지 확인
  if(req.query.userId != null){
    var userId = req.query.userId;
  } else {
    console.log("req error : no userId in parameter")
    result["error"] = "error : parameter value error from '/users/exist' request";
    res.json(result);
  }

  //유저가 이미 존재하는 회원인지 확인
  connection.query('SELECT * FROM USER WHERE userId=?', [userId], function(err, data){
    if(err){
      console.log(err);
      result["error"] = "error : database SELECT error from '/users/exist' request";
      res.json(result);
    } else {
      console.log("Database result data from /users/exist?userId=" + userId);
      console.log(data);

      if(data != null){
        //이미 가입한 유저
        console.log("already joined user " + userId);
        result["userState"] = "joinedUser";
        res.json(userState[]);
      } else {
        //새로운 유저
        console.log("new user " + userId);
        result["userState"] = newUser;
        res.json("newUser");
      }
    }
  });

});
