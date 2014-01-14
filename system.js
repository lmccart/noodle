/*

TASK (format)

date - date
status - int
trigger - 
query - obj
	input - 
	question - string
action - 




STATUS

0 - set
1 - triggered
2 - queried
3 - responded

*/


module.exports = function(settings) {

	var scheduler = require('./scheduler')({});

	var system = {};


	system.isLoggedIn = function() {
		return (scheduler.intel.mturk) ?  true : false;
	};

	system.addTask = function(task) {
		task.date = new Date();
		task.status = 0;
		scheduler.addTask(task);
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
