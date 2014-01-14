
module.exports = function(settings) {

	var fs = require('fs')
			, util = require("util")
			, parseString = require('xml2js').parseString
			, _ = require('underscore');


	var scheduler = {};
	scheduler.intel = require('./intel')({});
	scheduler.tasks = [];

		// load stored tasks
	fs.readFile('./data/tasks.json', 'utf8', function(error, data) {
	  if (data) data = JSON.parse(data);
	  for (var i=0; i<data.length; i++) {
	  		scheduler.tasks.push(data[i]); 
	  }
	});


	scheduler.addTask = function(task) {
		scheduler.intel.createHit( task, function(id) {
			task.id = id;
			scheduler.tasks.push(task);

	    // sync storage
			fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
			  if (err) throw err;
			});

		});
	};

	scheduler.removeTask = function(id) {

		scheduler.intel.removeHit( {'HITId':id} );

		scheduler.tasks = _.filter(scheduler.tasks, function(t){ return t.id !== id; });

		// sync storage    
		fs.writeFile('./data/tasks.json', JSON.stringify(scheduler.tasks), function (err) {
		  if (err) throw err;
		});
	};


	scheduler.checkTriggered = function() {

	};


  //scheduler.checkInterval = setInterval(scheduler.checkTriggered, 500);
  scheduler.checkTriggered();

	return scheduler;
};
