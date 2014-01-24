
module.exports = function(server) {

  var fs = require('fs')
    , util = require("util")
    , parseString = require('xml2js').parseString
    , _ = require('underscore')
    , io = require('socket.io').listen(server)

  var socket;

  var scheduler = {};
  scheduler.tasks = [];
  scheduler.intel = require('./intel')({tasks:scheduler.tasks});

    // load stored tasks
  fs.readFile('./data/tasks.json', 'utf8', function(error, data) {
    if (data) data = JSON.parse(data);
    for (var i=0; i<data.length; i++) {
      scheduler.tasks.push(data[i]); 
    }

    io.sockets.on('connection', function (skt) {
      socket = skt;
      console.log("connect"+socket);
      
      socket.emit('register', { modal: 'clock', event: 'time' });
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
        handleEvent(data);
      });

    });

    scheduler.checkInterval = setInterval(scheduler.update, 500);

  });


  scheduler.addTask = function(task) {
    scheduler.tasks.push(task);
    // register task with python
    socket.emit('register', { modal: task.trigger[0], event: task.trigger.slice(1) });

    // pend temp testing!
    scheduler.intel.createHit( task, function(id) {
      task.id = id;
    });

    // sync storage
    fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
      if (err) throw err;
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
      scheduler.intel.checkForHits(scheduler.tasks);
    }

    var responded = _.filter(scheduler.tasks, function(t){ return t.status === 2 });
    _.each(responded, function(elt) {

      // execute action
      var a = (task.actions.length === 1) ? task.actions[0] : task.actions[task.query.answer];
      socket.emit('fire', { modal: task.actions[a][0], event: task.actions[a].slice(1)});
    });

    // remove finished tasks
    scheduler.tasks = _.filter(scheduler.tasks, function(t){ return t.status !== 2 });

    // sync storage    
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
