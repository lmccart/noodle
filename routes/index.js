
/*
 * GET home page.
 */

var intel = require('../intel')({});

exports.index = function(req, res){
	console.log ("ind"+req.query.s);
	if (req.query.s && req.query.a) {
		intel.login({accessKey: req.query.a, secretKey: req.query.s});
	}
	if (!intel.mturk) res.render('login', { title: 'LOGIN' });
  else res.render('index', { title: 'HCV' });
};

exports.confirm = function(req, res){
	if (!intel.mturk) res.render('login', { title: 'LOGIN' });
	else {
		intel.createHit( {'title':req.query.q} );
	  res.render('confirm', { query: req.query.q });
	}
};

exports.remove = function(req, res){
	if (!intel.mturk) res.render('login', { title: 'LOGIN' });
	else {
		intel.removeHit( {'HITId':req.query.hit} );
  	res.render('manage', { tasks: intel.tasks });
  }
};

exports.manage = function(req, res){
	if (!intel.mturk) res.render('login', { title: 'LOGIN' });
  else res.render('manage', { tasks: intel.tasks });
};

exports.login = function(req, res){
  res.render('login', { title: 'LOGIN' });
};