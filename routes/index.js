
/*
 * GET home page.
 */

var system = require('../system')({});

exports.index = function(req, res){
	console.log ("ind"+req.query.s);
	if (req.query.s && req.query.a) {
		system.login({accessKey: req.query.a, secretKey: req.query.s});
	}
	if (!system.isLoggedIn()) res.render('login', { title: 'LOGIN' });
  else res.render('index', { title: 'HCV' });
};

exports.confirm = function(req, res){
	if (!system.isLoggedIn()) res.render('login', { title: 'LOGIN' });
	else {
		system.addTask({'title':req.query.q});
	  res.render('confirm', { query: req.query.q });
	}
};

exports.remove = function(req, res){
	if (!system.isLoggedIn()) res.render('login', { title: 'LOGIN' });
	else {
		system.removeTask(req.query.hit)
  	res.render('manage', { tasks: system.getTasks() }); //pend
  }
};

exports.manage = function(req, res){
	if (!system.isLoggedIn()) res.render('login', { title: 'LOGIN' });
  else res.render('manage', { tasks: system.getTasks() }); //pend
};

exports.login = function(req, res){
  res.render('login', { title: 'LOGIN' });
};