const routers = [
    {
        path: '/',
        meta: { title: '上传图片' },
        component: (resolve) => require(['./views/index.vue'], resolve),
        redirect:'/upload',
        children:[
            {
                path:'/upload',
                meta:{ title:'上传图片' },
                component:(resolve) => require(['./views/uploadInfo.vue'],resolve)
            }
        ]
    }
];
export default routers;