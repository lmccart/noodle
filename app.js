
/**
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs')
  , spawn = require('child_process').spawn
  , ls = spawn('python', ['test.py']);

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/confirm', routes.confirm);
app.get('/remove', routes.remove);
app.get('/manage', routes.manage);
app.get('/login', routes.login);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

ls.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});


ls.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});


for (var i = 0; i < 10; i++) {
  proc.stdin.write('THIS IS A TESTn');
}