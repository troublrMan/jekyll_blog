---
layout: post
title: 浅谈网页和客户端webapp存储
description: 普通网站有哪些存储信息的方式？客户端webapp呢？这里做个总结
category: blog
---

## 我能想到的客户端信息存储方式  

#### 网页

- `Cookie`，是存储在浏览器中的纯文本，浏览器的安装目录下会专门有一个 cookie 文件夹来存放各个域下设置的cookie  
- `sessionStorage`，是html5所支持的会话级别的本地存储 
- `localStorage`，是html5所支持的永久性的本地存储  
- `Indexed Database`，是一种在浏览器中通过 JavaScript 进行操作的功能强大的数据库   
- `Web SQL` 数据库，是HTML5提供了一个浏览器端的数据库支持，允许我们直接通JS的API在浏览器端创建一个本地的数据库，而且支持标准的SQL的CRUD操作，让离线的Web应用更加方便的存储结构化的数据  

> 注：Web SQL Databae在客户端实现了传统的SQL数据库操作，而Indexed Database更类似于NoSQL的形式来操作数据库，其中最重要的是Indexed Database不使用SQL作为查询语言。其数据存储可以不需要固定的表格模式，也经常会避免使用SQL的JOIN操作，并且一般具有水平可扩展性。

#### 客户端 webapp  
&emsp;&emsp;本人只做过 node webkit 打包的PC端webapp，仅以此作为探讨，其它的端不敢妄加揣测。使用新版本的node webkit基本能支持上述网页所支持的存储方式，相比之下客户端webapp还支持其它一些存储信息的方式

- `sqllite3`，是一款轻型的数据库
- 本地读取文件的方式

## Cookie
网页中的Cookie使用主要有两种 document.cookie 以及 request.Cookie。request.Cookie 主要应用场景是请求服务器时携带sessionId之类的信息，用于保持会话信息，通过HTTP Response Headers中的Set-Cookie Header和HTTP Request Headers中的Cookie Header设置或获取。我们这里主要要谈 document.cookie，这个 cookie 主要用于存储对应域名下的用户信息，提及一下httpOnly属性，用来设置cookie是否能通过 js 去访问。默认情况下，cookie不会带httpOnly选项(即为空)，所以默认情况下，客户端是可以通过js代码去访问（包括读取、修改、删除等）这个cookie的。当cookie带httpOnly选项时，客户端则无法通过js代码去访问（包括读取、修改、删除等）这个cookie，在客户端是不能通过js代码去设置一个httpOnly类型的cookie的，这种类型的cookie只能通过服务端来设置。

#### document.cookie的限制  
- 大多数浏览器支持最大为 4096 字节的 Cookie。  
- 浏览器还限制站点可以在用户计算机上存储的 Cookie 的数量。大多数浏览器只允许每个站点存储 20 个Cookie；如果试图存储更多 Cookie，则最旧的 Cookie 便会被丢弃。  
- 有些浏览器还会对它们将接受的来自所有站点的 Cookie 总数作出绝对限制，通常为 300 个。  
- Cookie默认情况都会随着Http请求发送到后台服务器，但并不是所有请求都需要Cookie的，比如：js、css、图片等请求则不需要Cookie。  

#### document.cookie 读取

```
var cookies = document.cookie;   //取到对应域名下面所有的cookie信息，是key=value; 形式的字符串
```

#### 写或修改 document.cookie

```
document.cookie = "userId=828";   //这条记录会追加到 cookies 中
//如果要一次存储多个名/值对，可以使用分号加空格（; ）隔开，例如：
document.cookie = "userId=828; userName=hulk";
```

#### 删除 document.cookie 的记录

```
//只要将需要删除的cookie重赋值，它的expires 选项设置为一个过去的时间点就行了
var exp = new Date();
exp.setTime(exp.getTime() -1);
document.cookie = 'xxx=xxx;expires=' + exp.toGMTString();
```

## sessionStorage  
在HTML5中增加了一个Js对象：sessionStorage；通过此对象可以直接操作存储在浏览器中的会话级别的WebStorage。存储在sessionStorage中的数据首先是Key-Value形式的，另外就是它跟浏览器当前会话相关，当会话结束后，数据会自动清除，跟未设置过期时间的Cookie类似。

sessionStorage提供了四个方法来辅助我们进行对本地存储做相关操作。
  
- setItem(key,value)添加本地存储数据  
- getItem(key)通过key获取相应的Value   
- removeItem(key)通过key删除本地数据    
- clear()清空数据  

```
//添加 key-value 数据到 sessionStorage
sessionStorage.setItem('carlen', 'http://www.carlen.site');
//通过 key 来获取value
var dt = sessionStorage.getItem('carlen');

sessionStorage.clear();
```

## localStorage  
在HTML5中增加了localStorage对象，以便于用户存储永久存储的Web端的数据。而且数据不会随着Http请求发送到后台服务器，而且存储数据的大小机会不用考虑，因为在HTML5的标准中要求浏览器至少要支持到4MB.所以，这完全是颠覆了Cookie的限制，为Web应用在本地存储复杂的用户痕迹数据提供非常方便的技术支持。  

localStorage 提供的方法和 sessionStorage 的方法非常类似

- setItem(key,value)添加本地存储数据  
- getItem(key)通过key获取相应的Value  
- removeItem(key)通过key删除本地数据  
- clear()清空数据  

## Indexed Database  
目前 Indexed Database 尚未完全达到可实际应用的阶段，但它成了可以在客户端使用的功能强大的数据库最好的选择（Web SQL Database 的标准制定已终止，从目前的技术来看可以说是以后唯一的选择）。   
妈哒，这里面有坑(如 setVersion 被废弃)，如果想进一步学习建议好好看看 [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

#### 连接数据库
我们可以通过调用 indexedDB 对象的 open 方法来连接数据库，连接是已异步的方式执行的，可以通过监听事件返回 promise 的方式对数据库进行引用

```
// 同时支持 callback 或 Promise 的调用接口
function getConnection(callback) {
	//对 indexedDB 的开发商前缀进行支持
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;   
	var request = indexedDB.open('testdb', '1.0');
	return new Promise(function(resolve, reject) {
		request.onsuccess = function(event) {
			callback && callback(null, event.target.result);
			resolve(event.target.result);
		};

		request.onerror = function(event) {
			callback && callback(new Error('连接失败'));
			reject(new Error('连接失败'));
		}

		request.onupgradeneeded = function(event) {
			var store = event.currentTarget.result.createObjectStore('books', {
				keyPath: '_id',   
				autoIncrement: true
			});
		}
	});	
}

//测试 callback 形式获取连接
getConnection(function(err, conn) {
	if(err) throw err;
	console.log(conn);
});

//测试 Promise 形式的连接
getConnection().then(function(conn) {
	console.log(conn);
}, function(err) {
	console.log(err);
});
```

#### 对象存储的创建
在读写数据之前，首先要创建对象存储这一用于保存数据的容器。  
&emsp;&emsp;注：只能够在数据库的版本更改事务中执行 createObjectStore，在调用 setVersion 后自动地在内部开始该事务。否则报错，贴上报错信息 Uncaught InvalidStateError: Failed to execute 'createObjectStore' on 'IDBDatabase': The database is not running a version change transaction.  
&emsp;&emsp;但 setVersion 被废弃，代替的方法是在 open() 的时侯传入表示版本号的字符串，同时使用 onupgradeneeded 事件代替了 setVersion() 方法。onupgradeneeded 事件会在 onsuccess 之前被调用。 已在“连接数据库”的代码中实现。

#### 数据的增、删、查
直接撸代码

```
//增
getConnection(function(err, db) {
	var trans = db.transaction(['books'], 'readwrite'),
	    store = trans.objectStore('books'),
	    newArray = ["wteamxq","151201"];
	//数据以对象形式保存，体现NoSQL类型数据库的灵活性
	var data = {
	    "text": "xq sb",
	    "indexId": "1",
	    "obj":newArray                         
	};
	var request = store.put(data);//保存数据
	request.onsuccess = function (e) {
	    console.log('插入数据成功！ key=' + e.target.result);
	};
	request.onerror = function(e) {
		consele.log('插入出错');
	};
});

//查
getConnection(function(err, db) {
	var trans = db.transaction(['books']);
	var request = trans.objectStore('books').get(1);    //此处 get(_id);
	request.onsuccess = function(e) {
		var data = e.target.result;
		console.log(data);
	}
});

//删
getConnection(function(err, db) {
	var trans = db.transaction(['books'], 'readwrite');
	var request = trans.objectStore('books').delete(1);
	request.onsuccess = function(e) {
		console.log('删除成功！');
	}
});
```

## Web SQL Database  
是HTML5提供了一个浏览器端的数据库支持，允许我们直接通JS的API在浏览器端创建一个本地的数据库，而且支持标准的SQL的CRUD操作。Web SQL Database 的标准制定已终止。

下面是其核心方法  

- openDatabase：这个方法使用现有的数据库或者新建的数据库创建一个数据库对象。  
- transaction：这个方法让我们能够控制一个事务，以及基于这种情况执行提交或者回滚。  
- executeSql：这个方法用于执行实际的 SQL 查询。  

#### 打开数据库  

```
//参数 数据库名称、版本号、描述文本、数据库大小、创建回调
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
```

#### 执行查询

```
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
db.transaction(function (tx) {  
   tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)');
});
```

#### 插入操作

```
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)');
   tx.executeSql('INSERT INTO LOGS (id, log) VALUES (1, "foobar")');
   tx.executeSql('INSERT INTO LOGS (id, log) VALUES (2, "logmsg")');
});
```

#### 读取操作

```
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)');
   tx.executeSql('INSERT INTO LOGS (id, log) VALUES (1, "foobar")');
   tx.executeSql('INSERT INTO LOGS (id, log) VALUES (2, "logmsg")');
});
db.transaction(function (tx) {
   tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
   var len = results.rows.length, i;
   msg = "<p>Found rows: " + len + "</p>";
   document.querySelector('#status').innerHTML +=  msg;
   for (i = 0; i < len; i++){
      alert(results.rows.item(i).log );
   }
 }, null);
});
```

## sqllite3  
本人使用环境 node-webkit, 首先是安装 [sqlite3](https://github.com/mapbox/node-sqlite3)

```
npm install sqlite3 --save
```

使用sqlite部分代码

```
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbpath);
//截取更新用户信息部分代码
db.all("SELECT * FROM users", function (err, rows) {
    if(!err){
        DES.init(APP_CONFIG.DESKEY,userInfo.loginName + "=" + loginInfo.password);
        var password = DES.Encrypt();
        for (var i = 0, len = rows.length; i < len; i++) {
            if(userInfo.loginName == rows[i].loginName){
                sql = 'update users set xxx';
                db.run(sql);
                return;
            }
        }
        sql = 'insert into users(...) values ...';
        db.run(sql);
    }
});
```

## 本地读取文件的方式
客户端下一般都有读取本地文件的方式，以 node webkit 为例  
处理好的 JavaScript 对象使用 JSON.stringify 转化为json字符串，然后通过 nodejs 的 fs 模块写入本地文件；读取时直接读出文件，使用 JSON.parse 转化为 JavaScript 对象，非常方便。不过运用场景仅仅适合数据量较小的配置文件之类。