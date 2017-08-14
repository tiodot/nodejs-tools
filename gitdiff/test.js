const str = `
diff --git a/src/params/index.js b/src/params/index.js
index ad12f45..4263b8f 100644
--- a/src/params/index.js
+++ b/src/params/index.js
@@ -4,6 +4,8 @@
  */

 function parseParams(search) {
+
+    console.log('dd解决');
     let ret = {},
         seg = search.replace(/^\\?/, '').split('&');
     for (let i of seg) {
@@ -12,6 +14,7 @@ function parseParams(search) {
             ret[s[0]] = decodeURIComponent(s[1]);
         }
     }
+    console.log('ddd');
     return ret;
 }
`;

const parser = require('./parse');
console.log(parser(str));