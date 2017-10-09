
import env from '../config/env';
import Vue from 'vue';
import _ from 'lodash';

let util = {

};
util.title = function(title) {
    title = title ? title + '' : '';
    window.document.title = title;
};

util.toDouble = function(n){
    return n<10 ? '0'+n : n;
};

util.deepCopy = function(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            this.deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
};

util.getQueryParam = function(){
    var obj = {};
    location.search.substr(1).split("&").forEach(function(i) {obj[i.split("=")[0]]=i.split("=")[1]});
    return obj;
};

export default util;