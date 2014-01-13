
module.exports = function(settings) {

	var fs = require('fs')
			, util = require("util")
			, parseString = require('xml2js').parseString;

	var scheduler = {};


	scheduler.addTask = function(task) {

	};

	scheduler.removeTask = function(id) {

	};


	scheduler.checkTriggered = function() {

	};


  //scheduler.checkInterval = setInterval(scheduler.checkTriggered, 500);
  scheduler.checkTriggered();

	return scheduler;
};
