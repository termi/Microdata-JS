// This file MUST be in <head> section of document

/*@cc_on
@if (@_jscript_version < 8)

var __URL_TO_ELEMENT_BEHAVIOR__='a.ielt8.htc',
	__STYLE_ID="ielt8_style_prev_for_behaviour";

var prevStyle=document.getElementById(__STYLE_ID),add="";
if(prevStyle){
(add=prevStyle.getAttribute("data-url")||"")?add="url("+add+") ":null;
alert(__URL_TO_ELEMENT_BEHAVIOR__ + "|" + prevStyle.id+" : "+add);
prevStyle.id="";
}

document.write("<style id='"+__STYLE_ID+"' data-url='"+__URL_TO_ELEMENT_BEHAVIOR__+"'>*{behavior: "+add+"url('"+__URL_TO_ELEMENT_BEHAVIOR__+"')}</style>");

@end
@*/