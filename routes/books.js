var express = require('express');
var bodyParser = require('body-parser');
var session = require('./passport.js');
var router = express.Router();
var mysql = require('./db_con')();
var dbConn = mysql.init();
mysql.test_open(dbConn);

router.get('/state',function(req, res, next){
  console.log("start /book/state router");

  //결과 값 담을 object
  var result={};

  //userId와 isbn이 제대로 있는지 확인
  if(req.query.userId != null && req.query.userId != 'undefined' && req.query.isbn != null && req.query.isbn != 'undefined'){
    var userId = req.query.userId;
    var isbn = req.query.isbn;
  } else {
    if(req.query.userId == 'undefined')
        console.log("req error : undefined value of userId in parameter");
    if(req.query.isbn == 'undefined')
        console.log("req error : undefined value of isbn in parameter");
    else if(req.query.userId == null)
        console.log("req error : userId in parameter is null");
    else
        console.log("req error : isbn in parameter is null");
    result["error"] = "error : parameter value error from /books/state' request";
    res.json(result);
  }

  //이미 등록된 책인지 check
  dbConn.query('SELECT BOOK_STATE FROM REGISTERBOOK WHERE USER_ID = ? AND BOOK_ISBN=?',[userId,isbn],function(err, data){
    if(err){
      console.log(err);
      result["error"] = "error : databsse SELECT error from /books/state' request";
      res.json(result);
    } else {
      console.log("Database result data from /books/state?userId="+userId+"&isbn="+isbn);
      console.log(data);

      if(data!= ""){
	//이미 등록되어 있음
	console.log("already registered book");
	result["bookState"] = "registeredBook";
	res.json(result);
      } else{
	//user에게 등록되지 않은 책
	console.log("not registered book");
	result["bookState"] = "newBook";
	res.json(result);
      }
    }
  });

});

router.get('/exist',function(req, res, next){
  console.log("start /books/exist");
  var result = {};

  //parameter에 book_isbn값이 정상적으로 있는지 확인
  if(req.query.isbn != null && req.query.isbn !='undefined'){
    var isbn = req.query.isbn;
  } else {
    if(req.query.isbn == 'undefined')
      console.log("req error : undefined value of isbn in parameter");
    else
      console.log("req error : no isbn in parameter");
    result["error"] = "error : parameter value error from '/books/exist' request";
    res.json(result);
  }
  //parameter에 userId가 정상적으로 있는지 확인
  if(req.query.userId != null && req.query.userId != 'undefined'){
    var userId = req.query.userId;
  } else {
    if(req.query.userId == 'undefined')
      console.log("req error : undefined value of userId in parameter");
    else
      console.log("req error : no userId in parameter");
    result["error"] = "error : parameter value error from '/books/exist' request";
    res.json(result);
  }

  //BOOK table에 존재하는 책인지 확인
  dbConn.query('SELECT * FROM BOOK WHERE BOOK_ISBN = ?',[isbn], function(err, data){
    if(err){
      console.log(err);
      resullt["error"] = "error : database SELECT error from '/books/exist' request";
      res.json(result);
    } else {
      console.log("Database result data from /books/exist?isbn="+isbn);
      console.log(data);

      if(data != ""){
	//이미 등록되어있는 책
        console.log("already registered book in BOOK table");

	//USER_ID, BOOK_ISBN, BOOK_STATE, ADD_DATE 추가해야함
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	if((day+"").length <2){
	  day = "0" + day;
	}
	var getToday = year + "-" + month + "-" + day;
	dbConn.query('INSERT INTO REGISTERBOOK VALUES(?,?,0,?,DEFAULT,DEFAULT,DEFAULT,DEFAULT,DEFAULT);',[userId,isbn,getToday], function(err, results, fields){
	  if(err){
	    console.log(err);
	    result["error"] = "error : database INSERT error from /books/exist";
	    res.json(result);
	  } else {
	    console.log("finish INSERT new BOOK in BOOK table");
	    result["bookState"] = "SUCCESS";
	    res.json(result);
	  }
	});
      } else {
	//새로운 책
	console.log("not in BOOK table, new BOOK");
	result["bookState"] = "newBook";
	res.json(result);
      }
    }
  });
});

router.post('/register',function(req, res, next){
  /*console.log("start /books/register");
  console.log("userId : " + req.body.userId);
  console.log("isbn : " + req.body.isbn);
  console.log("cover : " + req.body.cover);
  console.log("title : " + req.body.title);
  console.log("author : " + req.body.author);
  console.log("publisher : " + req.body.publisher);
  console.log("pubdate : " + req.body.pubdate);
  console.log("fixed_price : " + req.body.fixed_price);*/
  var result = {};

  dbConn.query('INSERT INTO BOOK VALUES(?,?,?,?,?,?,?);', [req.body.isbn, req.body.cover, req.body.title, req.body.author, req.body.publisher, req.body.pubdate, req.body.fixed_price], function(err, results, fields){
    if(err){
      console.log(err);
      result["error"] = "error : database INSERT error from /books/register";
      res.json(result);
    } else {
      console.log("finish INSERT new BOOK in BOOK table");

      //USER_ID, BOOK_ISBN, BOOK_STATE, ADD_DATE 추가해야함
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      var day = date.getDate();
      if((day+"").length <2){
        day = "0" + day;
      }
      var getToday = year + "-" + month + "-" + day;

      dbConn.query('INSERT INTO REGISTERBOOK VALUES(?,?,0,?,DEFAULT,DEFAULT,DEFAULT,DEFAULT,DEFAULT);',[req.body.userId,req.body.isbn,getToday], function(err, results, fields){
        if(err){
          console.log(err);
          result["error"] = "error : database INSERT error from /books/exist";
          res.json(result);
        } else {
          console.log("finish INSERT new BOOK in BOOK table");
          result["status"] = "SUCCESS";
          res.json(result);
        }
      });
    }
  });
});

// router.post('/update_reading',function(req, res, next){
//   console.log("readingStage : " + req.body.readingStage);
//   console.log("userId : " + req.body.userId);
//   console.log("isbn : " + req.body.isbn);
//   //body에 userId, isbn, readingStage를 받아온다
//   var result ={};
//
//   dbConn.query('UPDATE REGISTERBOOK set READING_STAGE = ? where USER_ID = ? AND BOOK_ISBN = ?;',[req.body.readingStage, req.body.userId, req.body.isbn], function(err, results){
//     if(err){
//       console.log(err);
//       result["error"] = "error : database UPDATE error from /books/update_reading";
//       res.json(result);
//     } else {
//       console.log("finish UPDATE REGISTERBOOK READING_STAGE");
//       result["status"] = "SUCCESS";
//       res.json(result);
//     }
//   });
// });

router.post('/update_reading',function(req, res, next){
  console.log("readingStage : " + req.body.readingStage);
  console.log("userId : " + req.body.userId);
  console.log("isbn : " + req.body.isbn);
  //body에 userId, isbn, readingStage를 받아온다
  var result ={};
  Return new Promise((fulfill, reject) => {
    if(err) reject(err);
    else fulfill(result);
  })
  .catch(err => {
    res.json(result);
  })
  .then(result => {
    return new Promise((fulfill , reject) => {
      dbConn.query('UPDATE REGISTERBOOK set READING_STAGE = ? where USER_ID = ? AND BOOK_ISBN = ?;',[req.body.readingStage, req.body.userId, req.body.isbn], function(err, results){
        if(err){
          result["error"] = "error : database UPDATE error from /books/update_reading";
          reject([err, result]);
        }
        else {
          result["status"] = "SUCCESS";
          fulfill(result);
        }
      });
    })
  })
  .catch(([err, result]) => {
    res.json(result);
  })
  .then(result => {
    return new Promise((fulfill, reject) => {
      dbConn.query('SELECT BOOK_ISBN FROM REGISTERBOOK where USER_ID = ? ', req.body.userId , function(err, result) => {
        if(err){
          reject(err);
        }
        else{
          fulfill(result);
        }
      })
    })
  })
  .catch(err => {
    res.json(err);
  })
  .then(result => {
    console.log(result);
    res.json(result);
  })
});

router.post('/review')
module.exports = router;
