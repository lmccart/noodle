
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
  , scheduler = require('./scheduler')(server);


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



app.isLoggedIn = function() {
  return (scheduler.intel.mturk) ?  true : false;
};

app.addTask = function(task) {
  task.id = new Date().getTime().toString();
  task.date = new Date();
  scheduler.addTask(task);
  for (var i=0; i<task.actions.length; i++) {
    for (var j=0; j<task.actions[i].length; j++) {
      if (task.actions[i][j] == 'play') {
        app.upload(task.actions[i][j+1]);
      }
    }
  }
};

app.upload = function(file) {
  console.log(file.substring(12));
  // fs.readFile(req.files.audio.path, function (err, data) {

  //   var imageName = req.files.audio.name

  //   /// If there's an error
  //   if(!imageName){
  //     console.log("There was an error, please try again.")
  //     res.redirect("/");
  //     res.end();

  //   } else {

  //     var newPath = __dirname + "/uploads/" + imageName;

  //     /// write file to uploads/fullsize folder
  //     fs.writeFile(newPath, data, function (err) {
  //       if (err) {
  //         console.log("There was an error, please try again.")
  //         res.redirect("/");
  //         res.end();
  //       } else res.redirect("uploads/" + imageName);
  //     });
  //   }
  // });
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

