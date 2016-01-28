var fs = require('fs');
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));
var path =require('path');

var color = {
  'black':            ['\x1B[30m', '\x1B[39m'],
  'red':              ['\x1B[31m', '\x1B[39m'],
  'green':            ['\x1B[32m', '\x1B[39m'],
  'yellow':           ['\x1B[33m', '\x1B[39m'],
  'blue':             ['\x1B[34m', '\x1B[39m'],
  'magenta':          ['\x1B[35m', '\x1B[39m'],
  'cyan':             ['\x1B[36m', '\x1B[39m'],
  'white':            ['\x1B[37m', '\x1B[39m']
};

function map (obj, callback, merge) {
  var index = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (merge) {
        callback[key] = obj[key];
      } else if (callback(key, obj[key], index++)) {
        break;
      }
    }
  }
}

function parseUrl (url, opt) {
  opt = opt || {};
  var Url = require('url');
  url = Url.parse(url);
  opt.host = opt.host || opt.hostname || url.hostname;
  opt.port = opt.port || url.port;
  opt.path = opt.path || (url.pathname + (url.search ? url.search : ''));
  opt.method = opt.method || 'GET';
  opt.agent = opt.agent || false;
  return opt;
}

function upload (url, data, content, filename, callback) {
  if (typeof content === 'string') {
    content = new Buffer(content, 'utf8');
  }
  else if (!(content instanceof Buffer)) {
    console.error(color['red'][0], 'unable to upload content [' + (typeof content) + ']', color['red'][1]);
  }

  var endl = '\r\n';
  var boundary  = '-----np' + Math.random();
  var collect = [];

  map(data, function(key, value) {
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
    collect.push(endl);
    collect.push(value + endl);
  });
  collect.push('--' + boundary + endl);
  collect.push('Content-Disposition: form-data; name="file"; filename="' + filename + '"' + endl);
  collect.push(endl);
  collect.push(content);
  collect.push('--' + boundary + '--' + endl);

  var length = 0;
  collect.forEach(function(ele) {
    length += ele.length;
  });
  var opt = parseUrl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': length
    }
  });
  var http = require('http');
  var req = http.request(opt, function(res) {
    var status = res.statusCode;
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    }).on('end', function () {
      if (status >= 200 && status < 300 || status === 304) {
        callback(null, body);
      } else {
        callback(status);
      }
    }).on('error', function(err) {
      callback(err.message || err);
    });

  });
  collect.forEach(function(d) {
    req.write(d);
    if (d instanceof Buffer) {
      req.write(endl);
    }
  });
  req.end();
}

function uploadSingleFile(url, data, file, name) {
  if (!name) {
    name = path.basename(file);
  }

  if (url.indexOf('http://') === -1) {
    url = 'http://' + url;
  }

  var content = fs.readFileSync(file);
  console.log(color.blue[0], 'uploading file [' + path.resolve(file) + '].......', color.blue[1]);
  upload(url, data, content, name, function(err, msg){
    if (err) {
      console.log(color.red[0], 'Upload error\n', color.red[1]);
      console.error(err);
    }
    else {
      console.log(color.cyan[0], 'The server [ ' + url + ' ] echo: ' + msg, color.cyan[1]);
    }
  });
}

function uploadMultiFile(url, data, files) {
  files.forEach(function(file) {
    uploadSingleFile(url, data, file);
  });
}


function help () {
  console.log(
    'Usage:\n' +
      '  node upload [options] filename(-f file)\n' +
    'Options:\n' +
      '  --help    | -h Print usage and options.\n' +
      '  --file    | -f Specify the upload file\n'    +
      '  --url     | -u Specify the server url, example: http://127.0.0.1:8000/upload\n' +
      '  --name    | -n The file name saved in server, default same with file name\n' +
      '  --to      | -t The file saved dir in server, default "./"\n' +
      '  --dir     | -d Upload directory'
  );
}

if (argv.h || argv.help) {
  help();
  process.exit(1);
}

var url = argv.u || argv.url || 'http://127.0.0.1:8000/upload';
var to = argv.d || argv.dist || './';
var name = argv.name || argv.n;
var file = argv.file || argv.f || argv._;

if (!file || (Array.isArray(file) && !file.length)) {
  console.error(color.red[0], 'Need specify a file to upload', color.red[1]);
  process.exit(1);
}

if (Array.isArray(file)) {
  uploadMultiFile(url, {to: to}, file);
}else {
  uploadSingleFile(url, {to: to}, file, name);
}