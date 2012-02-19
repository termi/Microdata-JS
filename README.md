# Implementation of the HTML5 Microdata specification

- __Spec__: http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html
- __Demo__: http://jsfiddle.net/cakz8/
- __Status__: Stable, but be carefull in IE < 9

## Example

    var img = document.createElement("img");
    img.itemProp = "test";
    img.src = "http://example.org/example.jpg";
    img.itemValue == img.src;//True
	
    var div = document.createElement("div");
    div.appendChild(p);
    div.itemScope = true;
    div.innerHTML = "<div><span><p itemprop=test>some test</p></span></div>";
    div.properties["test"][0].itemValue;//"some test"
		
More examples in `example` folder

## Microdata JS API

 - Element.itemValue
 - Element.itemProp
 - Element.itemScope
 - Element.itemId
 - Element.itemType
 - Element.itemRef
 - Element.properties
 - window.microdata_liveProperties = 
	`true` - for auto update Element.properties value
	`false` (default) - for cached Element.properties value

## Install
 - For modern browsers and IE8+:
  1. First add ES5 and DOM shim (for now only this shim supported: https://github.com/termi/ES5-DOM-SHIM/)

            <script src="a.js"></script>

  2. When add microdata script

            <script src="microdata-js.js"></script>

 - For IE6+ support:
  1. Add ES5 and DOM shim and microdata script as:

			<!--[if lt IE 9]>
			<script src="a.ie8.js"></script>
			<![endif]-->
			<!--[if lt IE 8]>
			<script src="a.ielt8.js"></script>
            <script src="microdata-js.ielt8.js"></script>
			<![endif]-->
			<script src="a.js"></script>
            <script src="microdata-js.js"></script>
	
  3. Put `a.ielt8.htc` (DOM shim for IE < 8) and `a.ie6.ielt8.htc` (for IE6) and `microdata-js.ielt8.htc` to the root of your site

## EXTRAs
TODO::
  
## Features

 - Live "properties" property (turn it on manualy window.microdata_liveProperties = true)
 - Implementation of PropertyNodeList and HTMLPropertiesCollection prototypes
 - Extending DocumentFragment.prototype with getItems function
 - Extending PropertyNodeList and HTMLPropertiesCollection prototypes with toJSON functions
 - IE < 8 support and maybe need some extra work
 
## Browsers support

 - Opera < 12, Google Chrome, Safary, FireFox, IE8 and IE < 8 support, and maybe others

## Tests

`tests/Microdata_tests_files/Microdata_tests.html` based on [Opera microdata tests](http://w3c-test.org/html/tests/submission/Opera/microdata/001.html)
		
## LIMITATION

 1. Require Utils.Dom.DOMStringCollection (DOMSettableTokenList like object) (created in https://github.com/termi/ES5-DOM-SHIM/)
 2. `microdata-js.ielt8.js` due to https://github.com/h5bp/html5-boilerplate/issues/378 i can't detection IE by `@cc`.
 3. Require `window.Node.prototype.ielt8` for IE < 8 detection, wich is created in https://github.com/termi/ES5-DOM-SHIM/
 4. Opera >= 11.60:
  - PropertyNodeList.values, PropertyNodeList.toJSON and HTMLPropertiesCollection.toJSON propertys will be available only after window.onload event

## TODO

 1. [Raynos DOM-shim](https://github.com/Raynos/DOM-shim/) support
 2. Live HTMLElement.prototype without window.microdata_liveProperties option
 3. Improvement speed of selecting Microdata ilements in IE < 8
 4. Delete code adding "values" property if it not compliance with FINALE Microdata specification
 5. [allows multiple values in itemtype](http://html5.org/tools/web-apps-tracker?from=6667&to=6668) ?
 
## License

    MIT