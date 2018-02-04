const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('./users');
const FacebookStrategy = require('passport-facebook');
const KakaoStrategy = require('passport-kakao').Strategy;
var mysql = require('./db_con')();
var connection = mysql.init();
mysql.test_open(connection);

module.exports = (app) => {

  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    done(null, user); // 여기의 user가 req.user가 됨
  });

  app.get('/auth/facebook', passport.authenticate('facebook', {
  authType: 'rerequest', scope: ['public_profile', 'email']
}));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' })
);

  //카카오톡
  app.get('/kakao',passport.authenticate('kakao-login'));
  app.get('/oauth/kakao/callback', passport.authenticate('kakao-login',{
    successRedirect : '/',
    failureRedirect : '/'
  }));

  passport.use(new LocalStrategy({ // local 전략을 세움
    usernameField: 'id',
    passwordField: 'pw',
    session: true, // 세션에 저장 여부
    passReqToCallback: false,
  }, (id, password, done) => {
    Users.findOne({ id: id }, (findError, user) => {
      if (findError) return done(findError); // 서버 에러 처리
      if (!user) return done(null, false, { message: '존재하지 않는 아이디입니다' }); // 임의 에러 처리
      return user.comparePassword(password, (passError, isMatch) => {
        if (isMatch) {
          return done(null, user); // 검증 성공
        }
        return done(null, false, { message: '비밀번호가 틀렸습니다' }); // 임의 에러 처리
      });
    });
  }));

  passport.use(new FacebookStrategy({
    clientID: '148648209187722',
    clientSecret: 'f7a93aacff239a0582391c846f0333a9',
    callbackURL: 'http://13.125.145.191:8000/auth/facebook/callback',
    passReqToCallback: true,
    profileFields:["id"]
  }, (req, accessToken, refreshToken, profile, done) => {
	connection.query('SELECT userId FROM User WHERE userId =?;',[profile.id],function(err,data){
		if(err){
			console.log(err);
		}
		else{
			//존재하는 회원인지 체크
			if(data != ''){
				//이미 존재하는  회원
				done(null, data[0]);
			}
			else{
				//새로운 회원
				connection.query('INSERT into User VALUES(?);',[profile.id], function(err, results, fields){
					if(err){
						throw error;
					}
					else console.log('New user signed up successfully');
				});
				done(null, profile.id);
			}
		}
	});
  }));

  passport.use('kakao-login',new KakaoStrategy({
	clientID:'aeb6c9dfb7375cfdec55f13cb09a02ae',
	clientSecret:'wQnfkj72iMx8mDzAeKDiv0qoggWc45Lv',
	callbackURL:'http://13.125.145.191:8000/oauth/kakao/callback'
	},
	function(accessToken,refreshToken, profile,done){
		connection.query('SELECT userId FROM User WHERE userId =?;',[profile.id],function(err,data){
			if(err){
                        	console.log(err);
                	}
			else{
				//존재하는 회원인지 체크
                        	if(data != ''){
                                	//이미 존재하는  회원
	                                done(null, data[0]);
        	                }
                	        else{
                        	        //새로운 회원
	                                connection.query('INSERT into User VALUES(?);',[profile.id], function(err, results, fields){
        	                                if(err){
                	                                throw error;
                        	                }
                                	        else console.log('New user signed up successfully');
	                                });
					console.log("profile이야" + profile.id);
        	                        done(null, profile.id);
                	        }
			}
		});
		//console.log(profile);
		//console.log('herer');
		
		//return done(null,profile);
	}
  ));
};
