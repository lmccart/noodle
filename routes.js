
/*
 * GET home page.
 */

module.exports = function(app) {

  var fs = require('fs');
  var routes = {};

  routes.index = function(req, res) {
    if (req.query.s && req.query.a) {
      app.login({accessKeyId: req.query.a, secretAccessKey: req.query.s});
    }
    if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
    else res.render('index', { title: 'Noodle' });
  };

  routes.add = function(req, res) {
    if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
    else {
      app.addTask(req.body);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true}));
    }
  };

  routes.remove = function(req, res) {
    if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
    else {
      app.removeTask(req.query.hit)
      res.render('manage', { tasks: app.getTasks() }); //pend
    }
  };

  routes.manage = function(req, res) {
    if (!app.isLoggedIn()) res.render('login', { title: 'LOGIN' });
    else res.render('manage', { tasks: app.getTasks() }); //pend
  };

  routes.login = function(req, res) {
    res.render('login', { title: 'LOGIN' });
  };

  routes.upload = function(req, res) {
    console.log('upload');
    console.log(req)
    fs.readFile(req.files.upload.path, function (err, data) {

      var imageName = req.files.upload.name

      /// If there's an error
      if(!imageName){
        console.log("There was an error, please try again.")
        res.redirect("/");
        res.end();

      } else {

        var newPath = __dirname + "/uploads/" + imageName;

        /// write file to uploads/fullsize folder
        fs.writeFile(newPath, data, function (err) {
          if (err) {
            console.log("There was an error, please try again.")
            res.redirect("/");
            res.end();
          } else res.redirect("uploads/" + imageName);
        });
      }
    });
  };

  routes.uploads = function(req, res) {
    file = req.params.file;
    var img = fs.readFileSync(__dirname + "/uploads/" + file);
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');
  };

  return routes;
};