var fs = require('fs');

var sourcePath = '../docs/markdown',
    targetPath = '../docs/html';

var css = '\
<style>\
* { padding: 0; margin: 0; }\
body { width: 90%; margin: 0 auto; padding: 1em 2em 2em; font-family: "Times New Roman"; border: 1px solid #eee; }\
h1 { border-bottom: 1px solid #eee; }\
h1, h2, h3, h4, h5 { padding: 0.4em 0; margin-bottom: 0.5em; }\
p { border-left: 0.4em #DDDDDD solid; padding: 0.1em 1em 0.5em; background: #FEFFFF; font-size: 0.9em; font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace; }\
hr { background: #E7E7E7; height: 0.2em; border: 0px; margin: 1em 0; }\
pre { margin: 1em 0; padding-bottom: 1em; background: #F7F7F7; font-size: 0.9em; font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace; word-wrap: break-word; overflow-x: auto; }\
code { background: #F5F5F5; padding: 0 0.5em; border: #E0E0E0 1px solid; color: #E21149; font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace; }\
</style>';

markdownToHTML(sourcePath, targetPath, css);

function markdownToHTML(sourcePath, targetPath, css) {
    var fileList = getAllFiles(sourcePath);
        len = fileList.length;

    for (var i = 0; i < len; i++) {

        var file = fileList[i],
            source = sourcePath + file;
            data = fs.readFileSync(source, 'utf8');

        data.replace("\r\n", "");

        var md = '<meta charset="utf-8">' + "\r\n" + 
                 // '<link rel="stylesheet" href="./css/style.css">' + "\r\n" + 
                 css + "\r\n" + 
                 '<body>' + "\r\n" +  toHTML(data) + "\r\n" +  '</body>';

            target = targetPath + file + '.html';
            fileInfo = getPathAndName(target);

        if (!exists(fileInfo.dir)) {
            mkdirSync(fileInfo.dir);
        }

        fs.writeFileSync(target, md, 'utf8');

        console.log(target + ' -------> succee');
    }
}

function mkdirSync(url, mode, cb) {
    var arr = url.split("/");
    mode = mode || 0777;
    cb = cb || function() {};
    if (arr[0] === ".") {
        arr.shift();
    }
    if (arr[0] == "..") {
        arr.splice(0, 2, arr[0] + "/" + arr[1]);
    }
    function inner(cur) {
        if (!exists(cur)) {
            fs.mkdirSync(cur, mode);
        }
        if (arr.length) {
            inner(cur + "/" + arr.shift());
        } else {
            cb();
        }
    }
    arr.length && inner(arr.shift());
}

function exists(path, mode) {
    try {
        fs.accessSync(path, mode);
        return true;
    } catch (e) {
        return false;
    }
}

function getAllFiles(root) {
    var res = [],
        files = fs.readdirSync(root);

    files.forEach(function(file) {
        var pathName = root + '/' + file, 
            stat = fs.lstatSync(pathName);

        if (!stat.isDirectory()) {
            res.push(pathName.replace(root, ''));
        } else {
            res = res.concat(getAllFiles(pathName));
        }
    });

    return res;
}

function getPathAndName(path) {
    var divide = path.lastIndexOf('/'),
        dir = path.substr(0, divide),
        fileName = path.substr(divide);

    return {
        dir: dir,
        file: fileName
    }
}

function toHTML(str) {

    var ELEMENTS = [{
            patterns: 'line',
            RegExp: /\n\>{1}\s{1}([\S\s]*?)\r/g,
            replacement: '<p>$1</p>'
     
        }, {

            patterns: 'strong',
            RegExp: /(\S*)\*{2}(\S*)\*{2}(\S*)/g,
            replacement: '$1<strong>$2</strong>$3'
     
        }, {
            patterns: 'em',
            RegExp: /(\S*)\*{1}(\S*)\*{1}(\S*)/g,
            replacement: '$1<em>$2</em>$3'
        }, {
            patterns: 'h6',
            RegExp: /\#{6} ([^\r\n^\#]*)*/g,
            replacement: '<h6>$1</h6>'
        }, {
            patterns: 'h5',
            RegExp: /\#{5} ([^\r\n^\#]*)*/g,
            replacement: '<h5>$1</h5>'
        }, {
            patterns: 'h4',
            RegExp: /\#{4} ([^\r\n^\#]*)*/g,
            replacement: '<h4>$1</h4>'

        }, {
            patterns: 'h3',
            RegExp: /\#{3} ([^\r\n^\#]*)*/g,
            replacement: '<h3>$1</h3>'
        }, {
            patterns: 'h2',
            RegExp: /\#{2} ([^\r\n^\#]*)*/g,
            replacement: '<h2>$1</h2>'
        }, {
            patterns: 'h1',
            RegExp: /\#{1} ([^\r\n^\#]*)*/g,
            replacement: '<h1>$1</h1>'
        }, {
       
            patterns: 'li',
            RegExp: /\+ ([^\r\n]*)*/g,
            replacement: '<li>$1</li>'
        }, {
            patterns: 'codeblock',
            RegExp: /\`{3}([\s\S]*?)\`{3}/g,
            replacement: '<pre><codeblock>$1</codeblock></pre>'
        }, {
            patterns: 'code',
            RegExp: /\`{1}([^\r\n^\`]*)\`{1}/g,
            replacement: '<code>$1</code>'
        }, {
            patterns: 'hr',
            RegExp: /-{3,}/g,
            replacement: '<hr>'
        }, {
            patterns: 'i',
            RegExp: /\[icon-([^\n]*)\]/g,
            replacement: "<i class='icon-$1'></i>"
        }, {
            patterns: 'img',
            RegExp: /\!\[([^\n\]]*)\]\(([^\s^\n]*)\s(\d*)\)/g,
            replacement: "<div><img src='$2'  alt='$1' width='$3'/></div>"
        }, {
            patterns: 'a',//[web](www.qq.com title)
            RegExp: /\[([^\n\]]*)\]\(([^\s^\n]*)\s([^\n\)]*)\)/g,
            replacement: "<a href='$2' title='$3'>$1</a>"
        }, {

            patterns: 'br',
            RegExp: /\r\n\r\n([\s]*?)\r\n/g,
            replacement: '<br>'
     
    }];

    for (var i = 0, len = ELEMENTS.length; i < len; i++) {
        if (typeof ELEMENTS[i].patterns === 'string') {
            str = replaceEls(str, {
                tag: ELEMENTS[i].patterns,
                replacement: ELEMENTS[i].replacement,
                RegExp: ELEMENTS[i].RegExp
            });
        } else {
            for (var j = 0, pLen = ELEMENTS[i].patterns.length; j < pLen; j++) {
                str = replaceEls(str, {
                    tag: ELEMENTS[i].patterns[j],
                    replacement: ELEMENTS[i].replacement,
                    RegExp: ELEMENTS[i].RegExp
                });
            }
        }
    }

    function replaceEls(str, elProperties) {
        return str.replace(elProperties.RegExp,elProperties.replacement);
    }
    return str;
}
