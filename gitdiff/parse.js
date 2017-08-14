// 匹配代码修改正则
const unifiedDiffRegex = /^@@ -([\d]+),([\d]+) [+]([\d]+),([\d]+) @@([\s\S]*?)(?=^@@)/gm;

module.exports = function (str) {
    const chunks = parse(str);
    // 解析每一个代码修改片段，然后合并所有位置信息
    // chunks.map(parseChunk)  => [[8, 9], [18]]
    // [[0, 1], [2, 3], [4, 5]].reduce((a, b) => a.concat(b)) => [0, 1, 2, 3, 4, 5]
    return chunks.map(parseChunk).reduce((result, chunkLine) => result.concat(chunkLine));
};

// 通过正则解析git diff出来的代码修改的地方
function parse(data) {
    let match;
    let chunks = [];
    do {
        match = unifiedDiffRegex.exec(`${data}\n@@`);
        if (match === null)
            break;
        // Stops excessive memory usage
        // https://bugs.chromium.org/p/v8/issues/detail?id=2869
        let chunk = (' ' + match[5]).substr(1);
        let currentStart = parseInt(match[3], 10);
        chunks.push({
            chunk,
            start: currentStart,
            end: currentStart + parseInt(match[4], 10)
        })
    } while (match !== null);
    return chunks;
}
// 解析每一个代码修改片段的具体修改位置
function parseChunk(chunkData) {
    const lines = chunkData.chunk.split('\n');
    lines.shift(); // 代码修改片段以\n开头，所以移除
    const start = chunkData.start;
    const chunkLines = [];
    let offset = 0;
    for (const l of lines) {
        switch (l[0]) {
            case '+':
                chunkLines.push(start + offset);
                break;
            case '-':
                offset--;
                break;
            default:
                break;
        }
        offset++;
    }
    return chunkLines;
}
