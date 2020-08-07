var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mobilesRouter = require('./routes/mobiles');

var mysql = require('mysql');
var connection = mysql.createConnection("mysql://pzg7aujuk0n3uct7:dei53piji51svpew@m7wltxurw8d2n21q.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/t0ilh41p5e4hjns4");
connection.connect(function(err) {
  if (err) throw err
  var create_view_t1 = "CREATE OR REPLACE VIEW t1 AS ( SELECT id FROM mobiles_test WHERE (battery < 3500 AND screen_size_inch > 6) OR (battery < 4000 AND screen_size_inch > 6.3))";
  var query0 = connection.query(create_view_t1);
    query0.on('result', function(row) {
      response = row;
    })
    .on('error', function(err) {
      response = err;
    });

});

var app = express();

app.get('/redirect', function(req, res, next) {
  redirection_url = decodeURI(req.query.url);
  res.send('<!DOCTYPE html><html><head><title>Please Wait...</title><meta http-equiv="refresh" content="3;url='+redirection_url+'"> </head><body style="background:black;"><center><h1>Please wait...</h1><img src="/images/logo.PNG" width="20%"/><br><a href="'+redirection_url+'">Click me to redirect manually</a></body></html>');
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));


app.use(express.static(path.join(__dirname, 'build')));


app.post('/top10/mobiles', (req, res) => {
  //res.sendFile(path.join(__dirname, 'build', 'index.html'));
  console.log(req.query);
  var price = parseInt(req.body.price)*1.1;
  var gamer = (req.body.gamer=='y'|| req.body.gamer=='yes' )?true:false;
    var get_mobiles_q = "SELECT DISTINCT mobile,amazon_link ,color, price , ram , memory ,battery ,camera_1 ,operating_system FROM mobiles_test  WHERE brand IS NOT NULL AND price <= "+price+" AND battery >= (CASE WHEN screen_size_inch >=6.3 THEN 4000 WHEN screen_size_inch >=6 THEN 3500 ELSE 3200 END) AND score >=( CASE WHEN "+price+" >= 15000 THEN 115 WHEN "+price+" >= 10000 AND "+price+" < 15000 THEN 100 ELSE 75 END ) AND ram >= ( CASE WHEN "+gamer+" THEN 4 ELSE 3 END) ORDER BY score DESC,ram DESC, camera_1 DESC, price DESC LIMIT 10";
    console.log(get_mobiles_q);
    connection.query(get_mobiles_q,(err, result) => {
      if(err) {
          console.log(err); 
          res.json({"error":true});
      }
      else { 
          //console.log(result); 
          res.json(result); 
      }
    });
    
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/top10', mobilesRouter);
;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 8080)
module.exports = app;