// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name microdata-js.ielt8.js
// ==/ClosureCompiler==

// This file MUST be in <head> section of document
// required window._ielt8_Element_proto

;(function() {

//[bugfix] due to https://github.com/h5bp/html5-boilerplate/issues/378 update IE detection
if(window.Node.prototype["ielt8"]) {//IE < 8 polifill

var __URL_TO_ELEMENT_BEHAVIOR__='microdata-js.ielt8.htc',
	__STYLE_ID="ielt8_style_prev_for_behaviour";

var prevStyle=document.getElementById(__STYLE_ID),add="";
if(prevStyle){
add=prevStyle.getAttribute("data-url")||"";
prevStyle.id="";
}

add+=" url(\""+__URL_TO_ELEMENT_BEHAVIOR__+"\") ";

document.write("<style id='"+__STYLE_ID+"' data-url='"+add+"'>html,body,div,span,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,abbr,address,cite,code,del,dfn,em,img,ins,kbd,q,samp,small,strong,sub,sup,var,b,i,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,figcaption,figure,footer,header,hgroup,menu,nav,section,summary,time,mark,audio,video,textarea{behavior: "+add+"}</style>");

}

})();