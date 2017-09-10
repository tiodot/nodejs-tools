# nodejs-tools
nodejs一些小工具，纯属学习。

# upload目录——文件上传和接收
该目录下是nodejs实现的简易的文件上传。使用步骤：

1. 部署receiver.js，这个用于服务器端接受文件；
2. 执行upload.js文件`node upload.js --url=www.example.com:8080 test.js`，使用node upload.js -h 获取相关使用参数。

upload.js相关参数说明：
```
--help | -h: 显示命令参数

--url  | -u: 设置服务器接受的地址

--file | -f: 配置需要上传的文件（暂时只支持单文件）

--to   | -t: 服务器保存文件的路径，不提供则默认使用 "./"

--name | -b: 服务保存文件所使用的文件名，不提供时，使用上传文件的名称

--dir  | -d: 上传某一个目录下的所有文件,会保持文件目录的结构
```

# url目录——解析location
该目录下提供一些解析location中参数的函数，包括以json形式返回参数列表，或者根据参数名称获取相关的值

# server目录——node简易文件服务器
简易版本的静态资源服务器

# promise目录——使用ES5实现一个简易版的promise
主要注意点为：
1. 使用setTimeout模拟一个异步操作
2. then返回的是一个promise
3. 如果promise为pending状态，需要保存其then中的回调函数。

