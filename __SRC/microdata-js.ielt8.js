// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @output_file_name microdata-js.ielt8.js
// ==/ClosureCompiler==

// This file MUST be in <head> section of document
// required
// 1. window.Node?prototype?ielt8
// 2. document.head

;(function() {

var __URL_TO_ELEMENT_BEHAVIOR__
  , __STYLE_ID

  , prevStyle
  , add
  , tmp
;

//[bugfix] due to https://github.com/h5bp/html5-boilerplate/issues/378 update IE detection
if((tmp = window["Node"]) && (tmp = tmp.prototype) && tmp["ielt8"]) {//IE < 8 polifill

	__URL_TO_ELEMENT_BEHAVIOR__ = 'microdata-js.ielt8.htc';
	__STYLE_ID="ielt8_style_prev_for_behaviour";

	prevStyle = document.getElementById(__STYLE_ID);
	add = "";

	if(prevStyle){
		add = prevStyle.getAttribute("data-url") || "";
		prevStyle.id = "";
	}

	add += " url(\""+__URL_TO_ELEMENT_BEHAVIOR__+"\") ";

	tmp = "<style id='" + __STYLE_ID + "' data-url='" + add + "'>*{behavior: " + add + "}</style>";

	document.readyState == "complete" ? 
		document.head.insertAdjacentHTML("beforeend", "<br>" + tmp)	
		:
		document.write(tmp)
	;

}

})();