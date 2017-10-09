<template>
    <div class="upload-info">
        <div class="title">上传图片</div>
        <div class="upload-wrap">
        	<file-upload 
        		ref="upload" 
        		:files="uploadInfo" 
        	></file-upload>
        </div>
        <div class="button">
        	<div class="upload-button" @click="handleUpload">开始上传</div>
        </div>
    </div>
</template>
<script>
    import util from './../libs/util';
    import FileUpload from './upload.vue';
    import _ from 'lodash';

    export default{
        data(){
            return {
                uploadInfo:[
            		{title:'title1', isNeed:true, prompt:'t1t1t1', fileType:'test1', fileList:[
                        {
                            'name': 'a42bdcc1178e62b4694c830f028db5c0',
                            'url': 'https://o5wwk8baw.qnssl.com/a42bdcc1178e62b4694c830f028db5c0/avatar'
                        }
                    ]},
            		{title:'title2', isNeed:false, prompt:'t2t2t2', fileType:'test2'},
                ]
            }
        },
        components:{
        	'file-upload':FileUpload
        },
        methods :{
            handleUpload(){
            	this.$refs.upload.submit();
            },
        }
    }
</script>
<style scoped>

</style>