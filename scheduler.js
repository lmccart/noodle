
module.exports = function(settings) {

	var fs = require('fs')
			, util = require("util")
			, parseString = require('xml2js').parseString;


	var scheduler = {};
	scheduler.intel = require('./intel')({});
	scheduler.tasks = [];

		// load stored tasks
	fs.readFile('./data/tasks.txt', 'utf8', function(error, data) {
	  var lines = data.match(/[^\r\n]+/g);
	  if (lines) {
	  	lines.forEach(function(line){
	  		scheduler.tasks.push(line); 
	  	});
	  }
	});


	scheduler.addTask = function(params) {
		scheduler.intel.createHit( params, function(id) {
			scheduler.tasks.push(id);

	    // sync storage
			fs.writeFile('./data/tasks.txt', scheduler.tasks.join('\n'), function (err) {
			  if (err) throw err;
			});

		});
	};

	scheduler.removeTask = function(id) {

		scheduler.intel.removeHit( {'HITId':id} );

		var index = scheduler.tasks.indexOf(id);
		if (index > -1) {
		    scheduler.tasks.splice(index, 1);

				// sync storage    
				fs.writeFile('./data/tasks.txt', scheduler.tasks.join('\n'), function (err) {
				  if (err) throw err;
				});
		}
	};


	scheduler.checkTriggered = function() {

	};


  //scheduler.checkInterval = setInterval(scheduler.checkTriggered, 500);
  scheduler.checkTriggered();

	return scheduler;
};
