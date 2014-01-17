
/**
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path')
  , ejs = require('ejs')
  , spawn = require('child_process').spawn
  , python = spawn('python', ['test.py'])
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

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

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  console.log("connect"+socket);
  socket.emit('hi', { hello: 'world' });
  socket.on('aaa', function (data) {
    console.log(data);
  });
});



