var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

http.createServer(function(req, res) {
  var urlObj = url.parse(req.url);
  console.log(util.inspect(urlObj));
  var filePath = '.' + decodeURI(urlObj.pathname);
  console.log('request '+ filePath + ' starting...');

  if (filePath === './favicon.ico') {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('no found', 'utf-8');
    return;
  }
  var stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    var dir = fs.readdirSync(filePath);
    var content = '';
    var prefix = decodeURI(urlObj.pathname);
    prefix.slice(-1) !== '/' ? prefix += '/' : '';
    dir.forEach(function(file) {
      content += '<a href="' + prefix + file + '">'+ file +'</a><br />';
    });
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(content, 'utf-8');
    return;
  }

  var extname = path.extname(filePath);
  console.log(extname);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpn':
      contentType = 'image/jpg';
      break;
    case '.wav':
      contentType = 'audio/wav';
      break;
    case '.flac':
      contentType = 'application/flac';
      break;
    case '.mp3':
      contentType = 'audio/mpeg';
      break;
  }

  fs.readFile(filePath, function(err, content) {
    if (err) {
      if (err.code == 'ENOENT') {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('NO FIlE FOUND');
      }
      else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    }
    else {
      res.writeHead(200, {'Content-Type': contentType});
      res.end(content, 'utf-8');
    }
  });
}).listen(8125);
console.log('Server running at port 8125');