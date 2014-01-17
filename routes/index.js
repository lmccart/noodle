
/*
 * GET home page.
 */

module.exports = function(app) {

	var routes = {};


	routes.index = function(req, res){
		console.log ("ind"+req.query.s);
		if (req.query.s && req.query.a) {
			app.login({accessKey: req.query.a, secretKey: req.query.s});
		}
		if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
	  else res.render('index', { title: 'HCV' });
	};

	routes.confirm = function(req, res){
		if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
		else {
			app.addTask({'title':req.query.q});
		  res.render('confirm', { query: req.query.q });
		}
	};

	routes.remove = function(req, res){
		if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
		else {
			app.removeTask(req.query.hit)
	  	res.render('manage', { tasks: app.getTasks() }); //pend
	  }
	};

	routes.manage = function(req, res){
		if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
	  else res.render('manage', { tasks: app.getTasks() }); //pend
	};

	routes.login = function(req, res){
	  res.render('login', { title: 'LOGIN' });
	};

	return routes;
};