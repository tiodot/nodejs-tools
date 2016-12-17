#!/Users/baidu/.nvm/versions/node/v6.2.0/bin/node
/**
 * @file 通过配置文件来上传文件
 */
var fs = require('fs');
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));
var path =require('path');
var configPath = (argv.f || argv.file);
var config = require(path.join(process.cwd(), configPath ? configPath : './upload.json'));

var colors = {
    'black':            ['\x1B[30m', '\x1B[39m'],
    'red':              ['\x1B[31m', '\x1B[39m'],
    'green':            ['\x1B[32m', '\x1B[39m'],
    'yellow':           ['\x1B[33m', '\x1B[39m'],
    'blue':             ['\x1B[34m', '\x1B[39m'],
    'magenta':          ['\x1B[35m', '\x1B[39m'],
    'cyan':             ['\x1B[36m', '\x1B[39m'],
    'white':            ['\x1B[37m', '\x1B[39m']
};

function help () {
    console.log(
        'Usage:\n' +
        '  node upload [options] filename(-f file)\n' +
        'Options:\n' +
        '  --help    | -h Print usage and options.\n' +
        '  --file    | -f Specify the upload  config file\n'
    );
}

function log (colorType, text) {
    var color = colors[colorType];
    if (color) {
        console.log(color[0], text, color[1]);
    }
    else {
        console.log(text);
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
        name = encodeURI(path.basename(file));
    }
    else {
        name = encodeURI(name);
    }

    if (url.indexOf('http://') === -1) {
        url = 'http://' + url;
    }

    var content = fs.readFileSync(file);
    log('blue', 'uploading file [' + path.resolve(file) + '].......');
    upload(url, data, content, name, function(err, msg){
        if (err) {
            log('red', 'Upload error\n');
            console.error(err);
        }
        else {
           log('cyan', 'The server [ ' + url + ' ] echo: ' + msg);
        }
    });
}

function uploadMultiFile(url, data, files) {
    files.forEach(function(file) {
        uploadSingleFile(url, data, file);
    });
}

function uploadDir(url, data, resourcePath, originPath) {
    var absPath = path.resolve(resourcePath);
    var exclude = data.exclude;
    if (exclude && exclude.length && exclude.indexOf(absPath) !== -1) {
        return ;
    }
    !originPath && (originPath = absPath);
    try {
        fs.statSync(absPath);
    }
    catch (e){
        log('red', 'Directory is not exist');
        console.error(e);
        process.exit(1);
    }

    // Read dir sync
    var dirs = fs.readdirSync(absPath);
    dirs.forEach(function(itemPath) {
        itemPath = path.join(absPath,itemPath);
        var stats = fs.statSync(itemPath);
        if (stats.isDirectory()) {
            uploadDir(url, data, itemPath, originPath);
        }
        else if (stats.isFile()) {
            data.to = encodeURI(path.join(data.origin, path.relative(originPath, absPath)));
            uploadSingleFile(url, data, itemPath)
        }
    });
}

function parseConfig () {
    var cwd = process.cwd();
    config.origin = config.to;
    if (config.exclude && config.exclude.length) {
        config.exclude = config.exclude.map(function (p) {
            return path.resolve(path.join(cwd, p));
        });
        console.dir(config.exclude);
        uploadDir(config.host, config, cwd);
        return;
    }

    if (config.include && config.include.length) {
        config.include.forEach(function (p) {
            var absPath = path.resolve(path.join(cwd, p));
            var stats = fs.statSync(absPath);
            if (stats.isDirectory()) {
                uploadDir(config.host, config, absPath, cwd);
            }
            else if (stats.isFile()) {
                config.to = encodeURI(path.join(config.origin, path.relative(p, absPath)));
                uploadSingleFile(config.host, config, absPath);
            }
        });

    }
}


function main() {
    if (argv.h || argv.help) {
        help();
        process.exit(1);
    }

    parseConfig();
}

main();
