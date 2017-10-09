#### 使用h5实现上传图片

---

##### 需求

想要实现上传图片的功能，但不想要引入网上的插件，这样会显得沉重，而且不利于后期的维护，在不考虑兼容性的条件下使用H5实现基本的上传图片功能。
    
##### 现状

目前，我们会遇到两个问题:
1. 获取图片的信息
2. 上传图片到服务器
    
##### 获取图片信息
    
上传的操作目前只有一种，那就是 input 标签，加上 type="file"，如下

```
<input class="hide" type="file" multiple="multiple">
```
当点击的时候就能选择图片进行选择，选择之后可以从 input 上面的 files 属性上获取图片的信息。H5添加了一个 FileReader 方法，它上面有一个 readAsDataURL 方法可以把图片信息以base64的形式返回出来，如下

```
const reader = new FileReader();
reader.onload = (e) => {
    console.log(e.target.result);
    //把图片url显示到页面中
}
reader.readAsDataURL(file);
```
这样获取的信息就是可以显现在页面上的 url ，制作缩略图就在获取 url 之后。

##### 上传信息到服务器

我们可以使用框架或者第三方工具携带的 ajax 方法进行请求，也可以使用原生的方法进行请求，关键是图片的参数不能用普通的 json 形式进行传递，而是用 formData 的形式，至于什么是 formData 的形式，就不多赘述了，使用方法如下：

```
const formData = new FormData();
formData.append(依次以 name,value 的形式添加params);
//eg:formData.append('name','value');
```
然后就是发送请求，在这里我使用的是原生的 http 请求，这样就不会产生依赖，具体方法如下：

```
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e)=>{
    this.uploadProgress(e, cIdx, pIdx)；
}, false);
xhr.open('POST', 'www.baidu.com', true);//添加请求api
xhr.send(formData)
xhr.onload = () => {
    if (xhr.status === 200 || xhr.status === 304) {
        //成功的操作
    }else{
        //失败的操作
    }
}
```

其中 xhr 下面会有一个 upload 的方法，这个方法就是上传图片的方法，里面会有上传从头到尾的具体流程，这里我们只用到了 progress 事件，因为需求是要展示上传的进度，在里面的 uploadProgress 方法会对进度进行处理并展示到页面上。

##### 最后

最主要的两个东西都解决了，剩下的就是怎么把上传图片做到自己想要的效果了，这就要修改样式，以及布局的问题了，具体的 demo 请看 src 文件下的 view 文件夹，也可 clone 到本地查看具体效果。

使用方法：
1. npm install
2. npm run dev
3. localhost:8080(默认自动打开的)
