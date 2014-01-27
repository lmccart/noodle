
module.exports = function(server) {

  var fs = require('fs')
    , util = require("util")
    , parseString = require('xml2js').parseString
    , _ = require('underscore')
    , io = require('socket.io').listen(server)

  var scheduler = {};
  scheduler.tasks = [];
  scheduler.intel = require('./intel')({tasks:scheduler.tasks});


  var socket;
  io.sockets.on('connection', function (skt) {
    socket = skt;
    console.log("connect"+socket);
    
    //socket.emit('register', { modal: 'audio', event: ['loud noise'] });

    socket.on('detected', function (data) {
      console.log("handle", data)
      scheduler.handleEvent(data);
    });

  });


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
  };

  scheduler.removeTask = function(id) {

    // remove hits as necessary
    var task = _.find(scheduler.tasks, function(t) {
      return t.id == id;
    });

    if (task) {
      if (task.hit_id) scheduler.intel.removeHit( {'HITId':task.hit_id} );
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
    socket.emit('fire', { modal: task.actions[a][0], event: task.actions[a].slice(1), id:task.id });

    scheduler.removeTask(task.id);

    fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
      if (err) throw err;
    });
  };

  scheduler.handleEvent = function(data) {

    console.log('handleEvent '+data);
    console.log(scheduler.tasks);
    console.log(data.event);
    // pend hack for now
    var triggered = _.filter(scheduler.tasks, function(t){ return t.trigger.slice(1)[0] == data.event[0]; });
    _.each(triggered, function(task) {
      console.log('found task ', task)
      scheduler.intel.createHit( task, function(id) {
        task.hit_id = id;

        // solicit python input
        if (task.query.input.length > 0) {
          socket.emit('fire', { modal:task.query.input[0], event:task.query.input[1], id:task.id });
        }

        // sync storage
        fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
          if (err) throw err;
        });

      });
    });
  };


  return scheduler;
};
