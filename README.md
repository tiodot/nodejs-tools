# nodejs-tools
nodejs一些小工具，纯属学习。

#upload目录
改目录下是nodejs实现的简易的文件上传。使用步骤：
1. 部署receiver.js，这个用于服务器端接受文件；
2. 执行upload.js文件`node upload.js --url=www.example.com:8080 test.js`，使用node upload.js -h 获取相关使用参数。

upload.js相关参数说明：
--help | -h: 显示命令参数
--url  | -u: 设置服务器接受的地址
--file | -f: 配置需要上传的文件（暂时只支持单文件）
--dist | -d: 服务器保存文件的路径，不提供则默认使用 "./"
--name | -b: 服务保存文件所使用的文件名，不提供时，使用上传文件的名称
