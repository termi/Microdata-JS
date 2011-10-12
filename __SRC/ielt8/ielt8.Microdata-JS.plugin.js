var __PATH_TO_BEHAVIOR = "Element.properties.htc";

MicrodataJS["plugins"].push(function(el) {
	el.style.behavior += " url(" + __PATH_TO_BEHAVIOR + ")";
	el.style.width = "1000px"
	el.__ie_getProperties__ = function() {
		return MicrodataJS["getItemProperties"](el);
	}
})