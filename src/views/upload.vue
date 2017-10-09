<template>
<div>
    <div class="upload-box" v-for="(file, index) in filesInfo">
        <div :class="{'upload-header':true, 'closed':file.isHide}">
            <div :class="{'file-type':true, isNeed:file.isNeed}">{{file.title}}</div>
            <div class="prompt-info">{{file.prompt}}</div>
            <div class="file-count">
                <span class="num">{{file.fileList ? file.fileList.length : 0}}张</span>
                <img class="image" src="../images/up.png" height="10" width="10" @click="handleHide(index)">
            </div>
        </div>
        <div :class="{'upload-body':true, 'closed':file.isHide}" :id="file.fileType">
            <div 
                class="upload-list" 
                v-for="(item, number) in file.fileList" 
            >
                <img class="picture" :src="item.url" :ref="item.name"/>
                <div class="upload-list-cover">
                    <span 
                        v-if=" item.status == 'ready' " 
                        class="delete-image"
                        @click="handleRemove(index, number)"
                    ></span>
                    <span class="bg-mask" v-if=" item.status == 'ready' " ></span>
                    <span class="eye" v-if=" item.status != 'uploading' " @click="handleView(file, item.name)"></span>
                    <div v-if="item.status == 'uploading'" class="upload-progress">
                        正在上传{{item.percent}}%
                    </div>
                </div>
            </div>
            <div class="upload-button">
                <div class="icon-button" @click="addFile(file.fileType)">
                    <span class="icon-img"></span>
                    <span class="icon-text">上传图片</span>
                </div>
            </div>
        </div>
        <input 
            class="hide" type="file" 
            :accept="format" 
            @change="fileChanged(file.fileType, index)" 
            :ref="file.fileType" multiple="multiple"
        >
    </div>
</div>
</template>
<script>
    export default {
        props:['files'],
        data () {
            return {
                filesInfo:[],
                format:['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/bmp'],
                view:null
            }
        },
        methods: {
            addFile(ref){
                this.$refs[ref][0].click();
            },
            fileChanged(ref, index) {
                const list = this.$refs[ref][0].files;
                let newFile = this.filesInfo[index];
                let lenth = newFile.fileList.length;
                for (let i = 0; i < list.length; i++) {
                    if (this.handleMaxSize(list[i])) {
                        let item = {
                            name: list[i].name,
                            file: list[i],
                            status: 'ready',
                            seqNo: lenth == 0 ? 0 : newFile.fileList[lenth - 1].seqNo + 1,
                            percent: 0
                        };
                        newFile.fileList.push(item);
                        this.html5Reader(list[i], newFile, index, item.seqNo);
                    }
                }
                this.$refs[ref][0].value = '';
            },
            // 将图片文件转成BASE64格式
            html5Reader(file, newFile, index, num){
                const reader = new FileReader();
                reader.onload = (e) => {
                    newFile.fileList[num].url = e.target.result;
                    this.filesInfo.splice(index, 1, newFile);
                }
                reader.readAsDataURL(file);
            },
            //上传
            submit(params) {
                if(this.validateUploading())return;
                this.filesInfo.forEach((item, pIdx) => {
                    item.fileList.forEach((file, cIdx) => {
                        if(file.status == 'ready'){
                            this.handleUpload(cIdx, pIdx, params);
                        }
                    });
                });
            },
            //校验上传是否完整
            validateFile(){
                let canSubmit = true;
                this.filesInfo.map(item => {
                    if(item.isNeed){
                        let count = 0;
                        item.fileList.map(file => {
                            if(file.status == 'finish'){
                                count++;
                            }
                        });
                        if(count == 0){
                            this.$Notice.warning({
                                title: '请上传' + item.title,
                                duration:5
                            });
                            canSubmit = false;
                        }
                    }
                });
                return canSubmit;
            },
            //上传途中不能上传
            validateUploading(){
                let isUploading = false;
                this.filesInfo.map(item => {
                    item.fileList.map(file => {
                        if(file.status == 'uploading'){
                            this.$Notice.warning({
                                title: item.title + '正在上传中',
                                duration:5
                            });
                            isUploading = true;
                        }
                    });
                });
                return isUploading;
            },
            //上传http请求
            handleUpload(cIdx, pIdx, params){
                let item = this.filesInfo[pIdx];
                let file = item.fileList[cIdx];

                file.status = 'uploading';
                item.fileList.splice(cIdx, 1, file);
                this.filesInfo.splice(pIdx, 1, item);

                const formData = new FormData();
                //formData.append(依次添加params);
                formData.append('fileType', item.fileType);
                formData.append('seqNo', file.seqNo);
                formData.append('imgFile', file.file);
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', (e)=>{this.uploadProgress(e, cIdx, pIdx)}, false);
                xhr.open('POST', 'www.baidu.com', true);//添加请求api
                xhr.send(formData)
                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 304) {
                        switch(JSON.parse(xhr.responseText).errorCode){
                            case 0:
                                file.status = 'finish';
                                item.fileList.splice(cIdx, 1, file);
                                this.filesInfo.splice(pIdx, 1, item);
                            break;
                            case 2:
                                this.$Notice.error({
                                    desc: '文件 ' + file.name + ' 参数错误',
                                    duration:5
                                });
                                this.handleRemove(pIdx, cIdx);
                            break;
                            case 3:
                                this.$Notice.error({
                                    title: '文件类型不符合规则',
                                    desc: '文件 ' + file.name + ' 不在gif,png,jpg,jpeg,bmp内',
                                    duration:5
                                });
                                this.handleRemove(pIdx, cIdx);
                            break;
                            case 4:
                                this.$Notice.error({
                                    title: '超出文件大小限制',
                                    desc: '文件 ' + file.name + ' 太大，不能超过 10M。',
                                    duration:5
                                });
                                this.handleRemove(pIdx, cIdx);
                            break;
                            case 11:
                                this.$Notice.error({
                                    desc: '系统繁忙，请稍后再试或联系客服4008-989-666。',
                                    duration:5
                                });
                                this.handleRemove(pIdx, cIdx);
                            break;
                        }
                    } else {
                        this.handleRemove(pIdx, cIdx);
                    }
                }
            },
            //上传进度
            uploadProgress(evt, cIdx, pIdx) {
                let item = this.filesInfo[pIdx];
                let file = item.fileList[cIdx];

                const component = this
                if (evt.lengthComputable) {
                    const percentComplete = Math.round((evt.loaded * 100) / evt.total);
                    file.percent = percentComplete;
                    item.fileList.splice(cIdx, 1, file);
                    this.filesInfo.splice(pIdx, 1, item);
                }else{
                    this.handleRemove(pIdx, cIdx);
                }
            },
            //移除图片
            handleRemove(pIdx, cIdx){
                let newFile = this.filesInfo[pIdx];
                newFile.fileList.splice(cIdx, 1);
                this.filesInfo.splice(pIdx, 1, newFile);
            },
            //调用viewer预览图片插件
            handleView(file, ref) {
                this.view !== null && this.view.destroy();
                this.view = new Viewer(document.getElementById(file.fileType));
                this.$refs[ref][0].click();
            },
            //校验图片尺寸
            handleMaxSize (file) {
                if(file.size > 10 * 1024 * 1024){
                    this.$Notice.warning({
                        title: '超出文件大小限制',
                        desc: '文件 ' + file.name + ' 太大，不能超过 10M。',
                        duration:5
                    });
                    return false;
                }else{
                    return true;
                }
            },
            //展开收起图片
            handleHide(index){
                let newFile = this.filesInfo[index];
                newFile.isHide = !newFile.isHide
                this.filesInfo.splice(index, 1, newFile );
            },
            //预处理数据
            handleData(){
                this.filesInfo = this.files.map(item => {
                    item.fileList = item.fileList || [];
                    item.isHide = item.fileList.length == 0 && this.isUpload == false;
                    item.visible = item.fileList.length !== 0;
                    item.fileList.map((file, index) => {
                        file.status = file.status || 'finish';
                        file.seqNo = file.seqNo || index;
                        return file;
                    });
                    //根据seqNo排序
                    item.fileList.sort((p, n) => p.seqNo > n.seqNo);
                    return item;
                });
            },
        },
        mounted(){
            this.handleData();
        }
    }
</script>
<style scoped>
    
</style>
