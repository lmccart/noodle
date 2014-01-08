
/*
 * GET home page.
 */

var intel = require('../intel')({});

exports.index = function(req, res){
  res.render('index', { title: 'HCV' });
};

exports.confirm = function(req, res){
	intel.createHit( {'title':req.query.q} );
  res.render('confirm', { query: req.query.q });
};

exports.remove = function(req, res){
	intel.removeHit( {'HITId':req.query.hit} );
  res.render('manage', { tasks: intel.tasks });
};

exports.manage = function(req, res){
  res.render('manage', { tasks: intel.tasks });
};