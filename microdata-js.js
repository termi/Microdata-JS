var g=null;
(function(f,j,l){function h(b){if(!h.e){if(!h.d){var e;if((e=b.DocumentFragment)&&(e=e.prototype))e.getItems=document.getItems;else{var f=function(){var b=f.g.call(document);b.getItems=document.getItems;return b};f.g=document.createDocumentFragment;document.createDocumentFragment=f}h.d=true}if(e=b.PropertyNodeList){"values"in(e=e.prototype)||e.__defineGetter__("values",function(){return this.getValues()});var j=b.PropertyNodeList;if(!(e=j.prototype).toJSON)e.toJSON=function(){for(var b=[],e=this.values,
f=-1,c;c=e[++f];)c instanceof Element&&(c=MicrodataJS.itemToJSON(c))&&b.push(c);return b};e=b.HTMLPropertiesCollection;if(!(e=e.prototype).toJSON)e.toJSON=function(){for(var b={},e=this.names,f=-1,c;c=e[++f];)this[c]instanceof j&&(b[c]=this[c].toJSON());return b};h.e=true}else b.addEventListener("DOMContentLoaded",h.bind(b,b),false),b.addEventListener("load",h.bind(b,b),false)}}(!document.getItems?function(b,e,f){var j=b.Utils.Dom.DOMException,m=b.Utils.Dom.DOMStringCollection;if(!b.PropertyNodeList){var i=
b.PropertyNodeList=function(){this.length=0;this.values=[]};i.prototype._push=function(a,d){this[this.length++]=a;this.values.push(d)};i.prototype.namedItem=function(){};i.prototype.values=void 0;i.prototype.getValues=function(){return this.values};i.prototype.toString=function(){return"[object PropertyNodeList]"}}if(!b.HTMLPropertiesCollection){var k=b.HTMLPropertiesCollection=function(){this.length=0;this.names=[]};k.prototype.c=function(){for(var a in this)this[a]instanceof i&&(this[a]=g,delete this[a]);
this.length=0;this.names=[]};k.prototype._push=function(a,d,b){this[this.length++]=a;~this.names.indexOf(b)||this.names.push(b);(this[b]||(this[b]=new i))._push(a,d)};k.prototype.namedItem=function(a){return this[a]instanceof i?this[a]:new i};k.prototype.toString=function(){return"[object HTMLPropertiesCollection]"};k.prototype.item=i.prototype.item=function(a){isNaN(a)&&(a=0);return this[a]||g}}var c=b.HTMLElement&&b.HTMLElement.prototype||b.Element&&b.Element.prototype;c&&Object.addProperties(c,
{itemValue:{get:function(){var a=this.nodeName;return this.getAttribute("itemscope")!==g?this:this.getAttribute("itemprop")===g?g:a==="META"?this.content:~"AUDIO,EMBED,IFRAME,IMG,SOURCE,TRACK,VIDEO".split(",").indexOf(a)?this.src:~["A","AREA","LINK"].indexOf(a)?this.href:a==="OBJECT"?this.data:a==="TIME"&&this.getAttribute("datetime")?this.dateTime:"textContent"in this?this.textContent:this.innerText},set:function(a){var d=this.nodeName;if(this.getAttribute("itemprop")===g)throw new j("INVALID_ACCESS_ERR");
return this[d==="META"?"content":~"AUDIO,EMBED,IFRAME,IMG,SOURCE,TRACK,VIDEO".split(",").indexOf(d)?"src":~["A","AREA","LINK"].indexOf(d)?"href":d==="OBJECT"?"data":d==="TIME"&&this.getAttribute("datetime")?"dateTime":"innerHTML"]=a}},itemProp:{get:function(){var a=this.getAttribute("itemprop"),d=this;d.a?a!==g&&d.a+""!==a&&d.a.update(a):d.a=new m(a,function(){d.setAttribute("itemprop",this+"")});return d.a},set:function(a){return this.setAttribute("itemprop",a)}},itemScope:{get:function(){return this.getAttribute("itemscope")!==
g},set:function(a){a?this.setAttribute("itemscope",""):this.removeAttribute("itemscope");return a}},itemId:{get:function(){var a=(this.getAttribute("itemid")||"").trim();a&&!/\w+:(\/\/)?[\w][\w.\/]*/.test(a)&&(a=location.href.replace(/\/[^\/]*$/,"/"+escape(a)));return a},set:function(a){return this.setAttribute("itemid",a+"")}},itemType:{get:function(){return this.getAttribute("itemtype")||""},set:function(a){return this.setAttribute("itemtype",a+"")}},itemRef:{get:function(){var a=this.getAttribute("itemref"),
d=this;d.b?a!==g&&d.b+""!==a&&d.b.update(a):d.b=new m(a,function(){d.setAttribute("itemref",this+"")});return d.b},set:function(a){return this.setAttribute("itemref",a+"")}},properties:{get:function(){var a=this.__properties_CACHE__;if(a)if(b.microdata_liveProperties)a.c();else return a;else a=this.__properties_CACHE__=new k;var d=[],e=[],c=[];f(this.childNodes).forEach(function(a){a.nodeType===1&&d.push(a)});this.getAttribute("itemref")&&(c=this.getAttribute("itemref").trim().split(/\s+/),c.forEach(function(a){(a=
document.getElementById(a))&&d.push(a)}));d=d.filter(function(a,b){var e=g,c=a,f=[];if(d.indexOf(a)!==b&&d.indexOf(a,b)!==-1)return false;for(;(c=c.parentNode)!==g&&c.nodeType===1;)if(f.push(c),c.getAttribute("itemscope")!==g){e=c;break}return e!==g?d.indexOf(e)!==-1?false:!f.some(function(a){var b=-1,c=g;if((b=d.indexOf(a))!==-1){for(a=d[b];(a=a.parentNode)!==g&&a.nodeType===1;)if(a.getAttribute("itemscope")!==g){c=a;break}if(c===e)return true}return false}):true});for(d.sort(function(a,b){return 3-
((b.compareDocumentPosition?b.compareDocumentPosition(a):b.contains?(b!=a&&b.contains(a)&&16)+(b!=a&&a.contains(b)&&8)+(b.sourceIndex>=0&&a.sourceIndex>=0?(b.sourceIndex<a.sourceIndex&&4)+(b.sourceIndex>a.sourceIndex&&2):1)+0:0)&6)});c=d.pop();)c.getAttribute("itemprop")&&e.push(c),c.getAttribute("itemscope")===g&&(c=f(c.childNodes).reverse(),c.forEach(function(a){a.nodeType===1&&d.push(a)}));e.forEach(function(b){$A(b.itemProp).forEach(a._push.bind(a,b,b.itemValue))});return a}}});try{document.createElement("EMBED").h+=
"123"}catch(l){}document.getItems=function(a){for(var a=(a||"").trim(),b=browser.f&&browser.f<8?e(".__ielt8_css_class_itemscope__",this):e("[itemscope]",this),c=[],f=(a||"").trim().split(/\s+/),i=0,j=b.length;i<j;++i){var h=b[i],k=h.getAttribute("itemtype");(!a||~f.indexOf(k))&&!h.getAttribute("itemprop")&&(!("itemScope"in h)||h.itemScope)&&c.push(h)}return c};h(b)}:h)(f,j,l)})(window,function(f,j){return window.$$?window.$$(f,j):Array.prototype.slice.apply(j.querySelectorAll(f))},function(f){return window.$A?
window.$A(f):Array.prototype.slice.apply(f)});