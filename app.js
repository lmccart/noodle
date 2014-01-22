
/**
 * Module dependencies.
 */


var express = require('express')
  , path = require('path')
  , ejs = require('ejs')
  , fs = require('fs')
  //, spawn = require('child_process').spawn
  //, python = spawn('python', ['test.py'])
  , app = express()
  , routes = require('./routes')(app)
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , scheduler = require('./scheduler')({});


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
app.post('/add', routes.add);
app.get('/remove', routes.remove);
app.get('/manage', routes.manage);
app.get('/login', routes.login);

app.post('/upload', routes.upload);
app.get('/uploads/:file', routes.uploads);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  console.log("connect"+socket);
  
  socket.emit('start', { modal: 'ht' });
  // socket.emit('fire', { modal: 'ht', event:'ping', args:'http://lauren-mccarthy.com/private/bird.php' });
  // socket.emit('fire', { modal: 'ht', event:'ping', args:'http://lauren-mccarthy.com/private/bird.php' });
  // socket.emit('fire', { modal: 'ht', event:'ping', args:'http://lauren-mccarthy.com/private/bird.php' });
  // socket.emit('fire', { modal: 'ht', event:'ping', args:'http://lauren-mccarthy.com/private/bird.php' });
  // socket.emit('fire', { modal: 'ht', event:'ping', args:'http://lauren-mccarthy.com/private/bird.php' });
  // socket.emit('fire', { modal: 'ht', event:'ping', args:'http://lauren-mccarthy.com/private/bird.php' });
  
  /*socket.on('aaa', function (data) {
    console.log('node received: '+data);
    socket.emit('aaa_response', { hello: 'world' });
  });

  socket.on('test', function (data) {
    console.log('test node received: '+data);
  });*/




  socket.on('event', function (data) {
    //console.log('event received: ', data);
    scheduler.handleEvent(data);
  });

});


app.isLoggedIn = function() {
  return (scheduler.intel.mturk) ?  true : false;
};

app.addTask = function(task) {
  task.id = new Date().getTime().toString();
  task.date = new Date();
  task.status = 0;
  task.trigger = "noise";
  scheduler.addTask(task);
};

app.removeTask = function(id) {
  scheduler.removeTask(id);
};

app.getTasks = function() {
  return scheduler.tasks;
};

app.login = function(params) {
  scheduler.intel.login(params);
}; //PEND

