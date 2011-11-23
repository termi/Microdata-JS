// This file MUST be in <head> section of document

;(function() {

var ie = 99;
/*@cc_on ie = @_jscript_version @*/

window.browser && window.browser.msie && (ie = window.browser.msie);

if(ie < 8) {

// Node.attributes path for IE < 8
// No Node.attributes patch for document.head :(
window["_ielt8_getAttributes"] = function __getAtt() {
	var tmp = this._ && this._["__ielt8_attributes__"],
		res = {length : 0},
		val;
	
	if(!tmp)throw Error("__ielt8_attributes__ is requared")
	
	for(var i = 0, l = tmp.length, k = 0 ; i < l ; i++)if((val = tmp[i]).specified && !(val.name in __getAtt.notAnAttribute)){
		res[k++] = val;
		res[tmp[i].name] = val;
		res.length++;
	}
	return res;
}
__getAtt.notAnAttribute = {"insertAfter" : 1, "getElementsByClassName" : 1, "compareDocumentPosition" : 1, "_" : 1, "getAttribute" : 1, "setAttribute" : 1, "addEventListener" : 1, "removeEventListener" : 1, "dispatchEvent" : 1}
//


var __URL_TO_ELEMENT_BEHAVIOR__='a.ielt8.htc',
	__URL_TO_IE6_ELEMENT_BEHAVIOR__='a.ie6.htc',
	__STYLE_ID="ielt8_style_prev_for_behaviour";

var prevStyle=document.getElementById(__STYLE_ID),add="";
if(prevStyle){
add=prevStyle.getAttribute("data-url")||"";
prevStyle.id="";
}

if(ie < 7)add+=(" url(\"" + __URL_TO_IE6_ELEMENT_BEHAVIOR__ + "\") ")

add+=" url(\""+__URL_TO_ELEMENT_BEHAVIOR__+"\") ";

document.write("<style id='"+__STYLE_ID+"' data-url='"+add+"'>html,body,div,span,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,abbr,address,cite,code,del,dfn,em,img,ins,kbd,q,samp,small,strong,sub,sup,var,b,i,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,figcaption,figure,footer,header,hgroup,menu,nav,section,summary,time,mark,audio,video,textarea,input,select{behavior: "+add+"}</style>");

}
})();