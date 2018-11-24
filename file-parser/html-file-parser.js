const formStr = `--------------------------5a7d1e7b9547a29b
Content-Disposition: form-data; name="file"; filename="demo.html"
Content-Type: text/html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>

</body>
</html>

--------------------------5a7d1e7b9547a29b--`;

function showRaw(str) {
  return require('util').inspect(str, { showHidden: true, depth: null })
}

function removeBoundary(str) {
  const regex = /\-{5,}[\w]+(--|\s)/g;
  let matched = formStr.match(regex);
  if (matched) {
    const [start, end] = matched;
    const content = str.slice(start.length, str.length - end.length);
    return content;
  }
  return null;
}

function parse(str) {
  str = removeBoundary(str);
  let prefix = 'Content-Disposition: form-data; name="file"; ';
  let start = str.indexOf(prefix) + prefix.length;
  let end = start + str.slice(start).indexOf('\n');
  // 获取fileName
  const fileName = str.slice(start, end);
  str = str.slice(end + 1);
  
  // 获取contentType
  prefix = 'Content-Type: ';
  start = str.indexOf(prefix) + prefix.length;
  end = start + str.slice(start).indexOf('\n');
  const contentType = str.slice(start, end);
  str = str.slice(end + 1);
  return {
    name: fileName.match(/filename="(.+)"/)[1],
    type: contentType,
    content: str
  }
}

const result = parse(formStr);

console.log(result);


