---
layout: post
title: 使用 webpack 进行模块打包
description: 最近老听人说webpack如何如何，忍不住看了一看，踩过不少坑，简单记录一下
category: blog
---

### webpack 简介
Webpack 是一个模块打包器，它将根据模块的*依赖关系*进行静态分析，然后将这些模块按照指定的规则生成对应的静态资源。

### 如何使用
要使用 webpack 进行打包，首先应该全局安装webpack工具

```
npm install webpack -g
```

#### webpack 基本命令  
   
```
webpack  //最基本的启动webpack的方法
webpack -w   //提供watch方法,实时进行打包更新
webpack -p   //对打包后的文件进行压缩
webpack -d   //提供source map，方便调式代码
```

进入要打包的项目，还是从头开始吧  
新建一个文件夹 命名webpackDemo？ 进入文件夹中，执行 ` npm init ` 初始化一个 package.json 。然后新建如下文件
        
├── src                 
│   ├── asset         &emsp;&emsp;// css 和 图片、文件资源（大杂烩）  
│   ├── index.html       &emsp;&emsp;// 项目入口文件  
│   ├── other.js         &emsp;&emsp;// 一个普通的引用的js文件  
│   ├── entry.js         &emsp;&emsp;// Webpack 预编译入口  
│   └── entry2.js        &emsp;&emsp;// Webpack 预编译入口  
├── package.json       &emsp;&emsp;// 项目配置文件  
└── webpack.config.js  &emsp;&emsp;// Webpack 配置文件  

webpack.config.js 是 webpack 的配置文件，执行 ` webpack ` 命令时根据该文件的信息进行模块打包

配置 webpack.config.js，安装使用的的模块（webpack、extract-text-webpack-plugin），根据自己需要配置 entry、output

```
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    // Webpack 编译入口文件,webpack根据这里的文件找到它的依赖和引入的模块，顺藤头摸瓜进行资源打包
    entry: {
        entry1: './src/entry',
        entry2: './src/entry'
    },
    output: {
        publicPath: '../build/', //服务器根路径
        path: './build', //编译到当前目录
        filename: '[name].js' //编译后的文件名字
    },
    module: {
        loaders: [
            {
                test: ...,
                loader: '...'
            },
            ...
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('common.js'), //将公用模块，打包进common.js
        //将样式统一发布到style.css中
        new ExtractTextPlugin("style.css", {
            allChunks: true,
            disable: false
        }),
        // 使用 ProvidePlugin 加载使用率高的依赖库
        new webpack.ProvidePlugin({
            $: 'webpack-zepto'
        })
    ],
    resolve: {
        extensions: ['', '.js', '.jsx'] //后缀名自动补全
    }
}
```

#### 使用ES6时，我们需要安装 babel 来处理 js 文件

```
npm install babel-core --save-dev    //babel 核心库
npm install babel-loader --save-dev   //babel 装载器
npm install babel-preset-es2015 --save-dev   //转码规则
```
webpack 配置文件中的 loaders 中对 js 装载配置如下

```
{
    test: /\.js$/,      //正则匹配规则
    loader: 'babel?presets=es2015'    //装载器，'?' 表示后面接参数条件，'!' 是装载器分割符
}
```

#### 编译css  
安装模块

```
npm install css-loader  --save-dev
npm install style-loader  --save-dev
npm install cssnext-loader  --save-dev
```
配置 webpack 中的 loaders

```
{
    test: /\.css$/,
    loader: ExtractTextPlugin.extract("style-loader", "css-loader?sourceMap!cssnext-loader")   //用到上述配置文件中引入的ExtractTextPlugin，用于将css打包到统一的 style.css 文件中
}
```

#### 编译 cass  
安装模块

```
npm install node-sass --save-dev
npm install sass-loader --save-dev
```
配置 webpack 中的 loaders

```
{
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract("style-loader", 'css-loader?sourceMap!sass-loader!cssnext-loader')
}
```

#### 编译文件  
安装模块

```
npm install file-loader --save-dev
```

配置 webpack 中的 loaders

```
{
    test: /\.(eot|woff|svg|ttf|woff2|gif)(\?|$)/,
    loader: 'file-loader?name=[hash].[ext]'
}
```

#### 编译图片  
安装模块

```
npm install url-loader --save-dev
```

配置 webpack 中的 loaders

```
{
    test: /\.(png|jpg)$/,
    loader: 'url?limit=800&name=[hash].[ext]' //当图片小于这个大小，启用base64编码图片
}
```

到此为止，常见的文件打包基本OK

entry.js 作为 Webpack 编译入口文件之一，我们可以这样引入文件

```
import './other.js';
import './asset/index.css';
import './asset/index.scss';

console.log("I'm entry");
```
这里使用ES6的模块（除此之外还可以使用 commonjs 规范中的 require 引入）就成功引入了js、css、scss，而js中可能还会引入其他的js，css中会引入文件、图片，这些资源都会按照配置打包，生成对应的静态资源。

看看如何使用打包的资源  
打开我们的项目入口文件 index.html 示例如下

```
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <title>test</title>
    <link rel="stylesheet" href="../build/style.css">
    <script src="../build/common.js"></script>
    <script src="../build/entry1.js"></script>
    <script src="../build/entry2.js"></script>
</head>
<body>
    <div class='red'>test webpack</div>
    <div class="blue">index2 css</div>
    <div class="yellow">index scss</div>
    <div class="img"></div>
    ...
</body>
</html>
```
