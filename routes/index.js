
/*
 * GET home page.
 */

var intel = require('../intel')({});

exports.index = function(req, res){
  res.render('index', { title: 'HCV' });
};

exports.confirm = function(req, res){
	intel.createHit(req.query.q);
  res.render('confirm', { query: req.query.q });
};