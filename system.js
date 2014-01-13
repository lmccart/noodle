
module.exports = function(settings) {

	var system = {};
	var scheduler = require('./scheduler')({});
	var intel = require('./intel')({});

	system.isLoggedIn = function() {
		return (intel.mturk) ?  true : false;
	};

	system.addTask = function(params) {
		intel.createHit( params );
	};

	system.removeTask = function(id) {
		intel.removeHit( {'HITId':id} );
	};

	system.getTasks = function() {
		return intel.tasks;
	}; // PEND

	system.login = function(params) {
		intel.login(params);
	}; //PEND

	return system;
};
