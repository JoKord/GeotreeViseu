var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars'); 

var routes = require('./server/routes/index');
var users = require('./server/routes/users');
var points = require('./server/routes/points');
var zones = require('./server/routes/zone');

var app = express();

var hbs = exphbs.create({ 
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'client', 'views', 'layouts')
});

// view engine setup
app.engine('handlebars', hbs.engine); 
app.set('views', path.join(__dirname, 'client', 'views'));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client', 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/points', points);
app.use('/zones', zones);

app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next(err);
  }
  console.error("ERROR");
  //res.status(404);
  //res.send(err.message || '** no unicorns here **');
});

// catch 404 and forward to error handler
app.use(function(err,req, res, next) {
  //var err = new Error('Not Found');
  //err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log("Reached Here.!");
    res.status(err.status || 500);
    res.render('error', {
      layout: 'error',
      message: err.message,
      status: err.status,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;