
module.exports = function(server) {

  var fs = require('fs')
    , util = require("util")
    , parseString = require('xml2js').parseString
    , _ = require('underscore')
    , io = require('socket.io').listen(server)

  var socket;
  io.sockets.on('connection', function (skt) {
    socket = skt;
    console.log("connect"+socket);
    
    socket.emit('register', { modal: 'clock', event: 'time' });

    socket.on('event', function (data) {
      handleEvent(data);
    });

  });

  var scheduler = {};
  scheduler.tasks = [];
  scheduler.intel = require('./intel')({tasks:scheduler.tasks});

    // load stored tasks
  fs.readFile('./data/tasks.json', 'utf8', function(error, data) {
    if (data) data = JSON.parse(data);
    for (var i=0; i<data.length; i++) {
      scheduler.tasks.push(data[i]); 
    }

    scheduler.checkInterval = setInterval(scheduler.update, 500);

  });


  scheduler.addTask = function(task) {
    scheduler.tasks.push(task);
    // register task with python
    socket.emit('register', { modal: task.trigger[0], event: task.trigger.slice(1) });

    // pend temp testing!
    scheduler.intel.createHit( task, function(id) {
      task.id = id;

      // sync storage
      fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
        if (err) throw err;
      });
    });



  };

  scheduler.removeTask = function(id) {

    // remove hits as necessary
    var task = _.find(scheduler.tasks, function(t) {
      return t.id == id;
    });

    if (task) {
      if (task.status > 0) scheduler.intel.removeHit( {'HITId':id} );
    }

    scheduler.tasks = _.without(scheduler.tasks, task);

    // sync storage    
    fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
      if (err) throw err;
    });
  };


  scheduler.update = function() {

    // check for responses
    if (scheduler.intel.mturk) {
      scheduler.intel.checkForHits(scheduler.tasks, scheduler.fireTask);
    }
  };

  scheduler.fireTask = function(task) {
    console.log('fire '+task.query.answer);
    var a;
    if (task.query.type == 'sa') a = 0;
    else if (task.query.type == 'tf') a = (task.query.answer == 'Yes') ? 0 : 1;
    else if (task.query.type == 'mc') a = parseInt(task.query.answer.substring(1), 10);
    console.log("a = "+a);

    console.log(task.actions);
    socket.emit('fire', { modal: task.actions[a][0], event: task.actions[a].slice(1)});

    scheduler.removeTask(task.id);

    fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
      if (err) throw err;
    });
  };

  scheduler.handleEvent = function(event) {

    var triggered = _.filter(scheduler.tasks, function(t){ return t.status === 0 && t.trigger === event.type; });
    _.each(triggered, function(elt) {
      elt.status = 1;

      scheduler.intel.createHit( elt, function(id) {
        elt.id = id;
      });
    });


    // sync storage    
    fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
      if (err) throw err;
    });
  };


  


  return scheduler;
};
