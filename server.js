var url = require('url');
var fs = require('fs');
var _p = require('path');

var router = {
  "/chart.js": "/../node_modules/chart.js/dist/Chart.js",
  "/bootstrap.min.css": "/../node_modules/bootstrap/dist/css/bootstrap.min.css",
  "/bootstrap-theme.min.css": "/../node_modules/bootstrap/dist/css/bootstrap-theme.min.css"
};

module.exports = function handler (req, res){
  var servefile = function  (err, data) {
    if (err) {
      console.log(err);
      res.writeHead(500);
      return res.end('Error loading');
    }
    res.writeHead(200);
    res.end(data);
  };

  var path = url.parse(req.url).pathname;
  if (path === '/dashboard.js' || path === '/index.html' || path === "/"){
    path = (path === '/dashboard.js') ? '/dashboard.js' : "/index.html";
    fs.readFile(__dirname + path, servefile);
  }else if (router[path] !== undefined) {
    fs.readFile(_p.resolve(__dirname + router[path]), servefile);
  }else{
    res.writeHead(404);
    res.end();
  }
};

var dgram = require('dgram'); // dgram is UDP

function broadcast() {
	
	var message = new Buffer(
		"M-SEARCH * HTTP/1.1\r\n" +
		"HOST:239.255.255.250:41234\r\n" +
		"MAN:\"ssdp:discover\"\r\n" +
		"ST:ssdp:all\r\n" + // Essential, used by the client to specify what they want to discover, eg 'ST:ge:fridge'
		"MX:1\r\n" + // 1 second to respond (but they all respond immediately?)
		"\r\n"
	);

	var client = dgram.createSocket("udp4");
  client.send(message, 0, message.length, 41234, "239.255.255.250", function(err, bytes){
    if (err) throw err;
    console.log('UDP message sent');
    client.close();
  });
}

setInterval(broadcast, 15000)