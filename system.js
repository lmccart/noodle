
module.exports = function(settings) {

	var scheduler = require('./scheduler')({});

	var system = {};


	system.isLoggedIn = function() {
		return (scheduler.intel.mturk) ?  true : false;
	};

	system.addTask = function(params) {
		scheduler.addTask(params);
	};

	system.removeTask = function(id) {
		scheduler.removeTask(id);
	};

	system.getTasks = function() {
		return scheduler.tasks;
	};

	system.login = function(params) {
		scheduler.intel.login(params);
	}; //PEND

	return system;
};
