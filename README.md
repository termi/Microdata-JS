# Implementation of the HTML5 Microdata specification

- __Spec__: http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html
- __Demo__: http://jsfiddle.net/termi/Nsq27/
- __Status__: Stable, but be carefull in IE8

## Example

```javascript
var img = document.createElement("img");
img.itemProp = "test";
img.src = "http://example.org/example.jpg";
img.itemValue == img.src;//True

var div = document.createElement("div");
div.appendChild(p);
div.itemScope = true;
div.innerHTML = "<div><span><p itemprop=test>some test</p></span></div>";
div.properties["test"][0].itemValue;//"some test"
```
		
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

```html
<script src="a.js"></script>
```

  2. When add microdata script

```html
<script src="microdata-js.js"></script>
```

 - For IE8+ support:
  1. Add ES5 and DOM shim and microdata script as:

```html
<!--[if IE 8]>
<script src="a.ie8.js"></script>
<![endif]-->
<script src="a.js"></script>
<script src="microdata-js.js"></script>
```

## EXTRAs
TODO::
  
## Features

 - Live "properties" property (turn it on manualy window.microdata_liveProperties = true)
 - Implementation of PropertyNodeList and HTMLPropertiesCollection prototypes
 - Extending DocumentFragment.prototype with getItems function
 - Extending PropertyNodeList and HTMLPropertiesCollection prototypes with toJSON functions
 - Inherit native PropertyNodeList and HTMLPropertiesCollection prototypes from Array
 
## Browsers support

 - Opera < 12, Google Chrome, Safary, FireFox, IE8 and maybe others

## Tests

`tests/Microdata_tests_files/Microdata_tests.html` based on [Opera microdata tests](http://w3c-test.org/html/tests/submission/Opera/microdata/001.html)
		
## LIMITATION

 1. Require window.DOMStringCollection (DOMSettableTokenList like object) (created by https://github.com/termi/ES5-DOM-SHIM/)
 2. Opera >= 11.60:
  - PropertyNodeList.values, PropertyNodeList.toJSON and HTMLPropertiesCollection.toJSON propertys will be available only after window.onload event

## TODO

 1. Live HTMLElement.prototype without window.microdata_liveProperties option
 2. Delete code adding "values" property if it not compliance with FINALE Microdata specification
 3. FireFox bug $0.itemId = "" -> $0.itemId != ""
 
## License

    MIT
