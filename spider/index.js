/**
 * Created by swxy on 2017/2/18.
 */
const Crawler = require("crawler");
const url = require('url');
const fs = require('fs');
const config = require('./config.json');

const urlObj = url.parse(config.url);
const host = urlObj.protocol + '//' + urlObj.host;

let output = [];

const crawler = new Crawler({
    maxConnections : 10,
    callback : function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            const currentConfig = res.options.config;
            currentConfig.selector.forEach(sel => {
                const {text, attr, type} = sel.output;
                let $target = $(sel.element, sel.root);
                if (sel.nth !== undefined) {
                    $target = $target.eq(sel.nth);
                }
                const results = [];
                $target.each((idx, ele) => {
                    const result = Object.create(null);

                    if (text) {
                        result['text'] = $(ele)[text]();
                    }
                    if (attr) {
                        result[attr] = $(ele).attr(attr);
                    }
                    if (type) {
                        result['type'] = type;
                    }

                    if (JSON.stringify(results) !== '{}') {
                        results.push(result);
                    }
                });

                if (sel.action && sel.action.recursive) {
                    results.forEach((result) => {
                        crawler.queue({
                            uri: host + result[sel.output.attr],
                            config: sel.action
                        });
                    });
                } else {
                    // 直接输入
                    output.push(...results);
                }
            });

            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
        }
        done();
    }
});

// crawler.queue(config.url);

crawler.queue({
    uri: config.url,
    config: config
});

crawler.on('drain',function(){
    // console.dir(output);
    saveMD(toMD(output));
});

function toMD (output) {
    let md = '';
    for (let item of output) {
        switch (item.type) {
            case 'h1':
                md += `# ${item.text.trim().replace('鉴赏', '')}`;
                break;
            case 'text':
                md += item.text.replace(/\t\s*/g, '');
                break;
        }
        md += '\r\n';
    }
    console.log(md);
    return md;
}

function saveMD (md) {
    fs.writeFile('output.md', md, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('success')
    });
}