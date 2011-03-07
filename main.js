/*
 * Example code from: http://boldr.net/create-a-web-app-with-node
 *
 * See also: http://nodejs.org/docs/v0.1.97/changelog.html
 *
 *  specifically:
 *     - require('posix') -----------------> require('fs')
 *     - fs.cat ---------------------------> fs.readFile
 * */

var sys = require('sys'), http = require('http'), fs = require('fs');
var Mustache = require('mustache');
var _ = require('underscore');

var actions = [];

actions.push({
    path: "/",
    template: "index.html",
    view: {
      title: "Joe",
     calc: function() { return 2 + 4; }
    }
});

sys.debug("starting server...");
http.createServer(function (req, res) {
//  req.addListener('complete', function(){
    var action = _(actions).chain().select(function(a){
      return req.url == a.path;
//      return req.uri.path == a.path;
    }).first().value();

    sys.debug("action = " + action);

    if (_.isEmpty(action)){ 
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end("Error");
    } else {
      fs.readFile("./templates/" + action.template, 'utf8', function(err, template){
          if (err){
              res.setHeader('Content-Type', 'text/html');
              res.statusCode = 500;
              res.end(err + "\n");
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(Mustache.to_html(template, action.view));
      });
    }
//  });
}).listen(8000);
