// 日本語の文字化けを防ぐため、サンプルコードにはcharset指定を含んだContent-Typeヘッダを追加しています。
// todo:最初のリクエスト以外はキャッシュメモリから配信する

var http = require('http');
var path = require('path');
var fs = require('fs');

var mimeTypes = {
	'.js': 'text/javascript',
	'.html': 'text/html',
	'.css': 'text/css'
};

var cache = {};

//todo:ファイルを読み込んでキャッシュ(cache)に格納するメソッド
function cacheAndDeliver(f, cb) {
	if (!cache[f]) {
		fs.readFile(f, function(err, data) {
			if (!err) {
				cache[f] = {content: data}
			}
			cb(err, data);
		});
		return;
	}
	console.log(f + 'をキャッシュから読み込みます。');
	cb(null, cache[f].content);
}

http.createServer(function (request, response) {
	var lookup = path.basename(decodeURI(request.url)) || 'index.html',
	f = 'content/' + lookup;
	fs.exists(f, function (exists) {
		if (exists) {
            //todo:fs.readFileの代わりにcacheAndDeliverメソッドを使う
			cacheAndDeliver(f, function(err, data) {
				if (err) {
					response.writeHead(500);
					response.end('Server Error!');
					return;
				}
				var headers = {'Content-Type': mimeTypes[path.extname(f)] + ';charset=utf-8' };
				response.writeHead(200, headers);
				response.end(data);
			});
			return;
		}
		response.writeHead(404);
		response.end('ページがみつかりません！');
	});
}).listen(8080);
