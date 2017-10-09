import 'babel-polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Routers from './router';
import Vuex from 'vuex';
import Util from './libs/util';
import App from './app.vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import VueResource from 'vue-resource';
import _ from 'lodash';

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(iView);
Vue.http.options.emulateJSON = true;
Vue.config.devtools = true;

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: Routers
};

const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    document.title = to.meta.title;
    document.body.style.overflow = 'hidden';
    Util.title(to.meta.title);
    next();
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

new Vue({
    el: '#app',
    router: router,
    // store: store,
    render: h => h(App)
});