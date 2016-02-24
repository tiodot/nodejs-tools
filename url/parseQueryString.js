/*
 * 针对location解析的一些方案收集
 */

/**
 * 该方案来自于stackoverflow, 链接:
      http://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript

    e.g. www.domain.com/?v=123&p=hello
    =>
    {
      v: 123,
      p: hello
    }
 */
function parseUrlParameterToJson(hashBased) {
  var query;
  if(hashBased) {
    var pos = location.href.indexOf("?");
    if(pos==-1) return [];
    query = location.href.substr(pos+1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]");
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}

//获取url指定参数的值, e.g. www.domain.com/?v=123&p=hello  ==> getParameterByName('v')=>123
function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.href);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

