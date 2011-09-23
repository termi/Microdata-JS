// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level VERBOSE
// @jscomp_warning missingProperties
// @output_file_name default.js
// @check_types
// ==/ClosureCompiler==
/*
 * @author: Egor
 * @date: 10.08.2011
 *
 *  Implementation of the HTMl5 Microdata specification.
 *
 * Compilation of this sources:
 * 1. https://github.com/carlmw/Microdata-JS
 * 2. https://github.com/Treesaver/treesaver/blob/2180bb01e3cdb87811d1bd26bc81af020c1392bd/src/lib/microdata.js
 * 3. http://www.w3.org/TR/html5/microdata.html
 *
 * @version 2.1.1
 */

global["MicrodataJS"] = {};
/**
 * Returns the itemValue of an Element.
 * http://www.w3.org/TR/html5/microdata.html#values
 * or http://dev.w3.org/html5/md/#dom-itemvalue
 *
 * @param {Element} element The element to extract the itemValue for.
 * @return {string|Node} The itemValue of the element or Microdata Item element
 */
MicrodataJS["getItemValue"] = function(element) {
	var elementName = element.nodeName;

	if(element.getAttribute("itemscope") !== null)//hasAttribute("itemscope")
		return element;
	else if(elementName === 'META')
		return element.content;
	else if(~['AUDIO', 'EMBED', 'IFRAME', 'IMG', 'SOURCE', 'VIDEO'].indexOf(elementName))
		return element.src;
	else if(~['A', 'AREA', 'LINK'].indexOf(elementName))
		return element.href;
	else if(elementName === 'OBJECT')
		return element.data;
	else if (elementName === 'TIME' && element.getAttribute('datetime'))
		return element.dateTime;//TODO:: Check IE[7,6]
	else
		return 'textContent' in element ? element.textContent :
			element.innerText;//IE-only fallback
}
/**
 * Set the itemValue of an Element.
 * http://www.w3.org/TR/html5/microdata.html#values
 *
 * @param {Element} element The element to extract the itemValue for.
 * @param {string} value The itemValue of the element.
 * @return {string} "value" param value
 */
MicrodataJS["setItemValue"] = function(element, value) {
	var elementName = element.nodeName,
		attrTo = "innerHTML";

	if(elementName === 'META')
		attrTo = "content";
	else if(['AUDIO', 'EMBED', 'IFRAME', 'IMG', 'SOURCE', 'VIDEO'].indexOf(elementName) !== -1)
		attrTo = "src";
	else if(['A', 'AREA', 'LINK'].indexOf(elementName) !== -1)
		attrTo = "href";
	else if(elementName === 'OBJECT')
		attrTo = "data";
	else if (elementName === 'TIME' && element.getAttribute('datetime'))
		attrTo = "dateTime";//TODO:: Check IE[7,6]
	
	//Если в шаблоне не указано откуда брать данные - проверяем текстовые ноды
	return element[attrTo] = value;
}

;(!document["getItems"] ? (
// 1. Microdata unsupported
/**
 * @param {Window|Object} global The global object
 * @param {!Function} $$ querySelectorAll with toArray (must return Array)
 * @param {!Function} _toArray Function must return an Array representation of the enumeration.
 */
function(global, $$, _toArray) {
	//Import
	var MicrodataJS = global["MicrodataJS"];
	
	/**
	 * Fix Microdata Item Element for browsers with no Microdata support
	 *
	 * @param {Element} _element The Microdata DOM-element with 'itemScope' and 'itemtype' attributes
	 * @return {Element}
	 */
	MicrodataJS["fixItemElement"] = function(_element) {
		var val;
		_element['itemScope'] = true;

		// Attach the (none-live) properties attribute to the element
		_element['properties'] = getProperties(_element);

		if(val = _element.getAttribute("itemid"))//hasAttribute
			_element['itemId'] = val;
			
		if(val = _element.getAttribute("itemref"))//hasAttribute
			_element['itemRef'] = val;

		if(val = _element.getAttribute("itemtype"))//hasAttribute
			_element['itemType'] = val;
		
		return _element;
	}
	
	if(!global["PropertyNodeList"]) {
	// --- === PropertyNodeList CLASS [BEGIN] === ---
	/**
	 * @constructor
	 */
	var PropertyNodeList = global["PropertyNodeList"] = function () {
		var thisObj = this;

	/* PUBLICK */
		/** @type {number} */
		thisObj["length"] = 0;
		/** @type {Array} "values" property http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api */
		thisObj["values"] = [];
	}
	/**
	 * Non-standart (not in vative PropertyNodeList class) method
	 * @param {Element} newNode DOM-element to add
	 */
	PropertyNodeList.prototype._push = function(newNode, prop_value) {
		var thisObj = this;
		
		thisObj[thisObj["length"]++] = newNode;
		thisObj["values"].push(prop_value)
	}
	/**
	 * @param {string} p_name property name
	 * @return {PropertyNodeList}
	 */
	PropertyNodeList.prototype["namedItem"] = function(p_name) {
		//TODO:: Still don't know what code here
	}
	/**
	 * @return {Array}
	 */
	PropertyNodeList.prototype["getValues"] = function() {
		return this["values"];
	}
	/**
	 * @return {string}
	 */
	PropertyNodeList.prototype.toString = function() {
		return "[object PropertyNodeList]";
	}
	
// --- === PropertyNodeList CLASS [END] and method item below === ---
	}

	if(!global["HTMLPropertiesCollection"]) {
// --- === HTMLPropertiesCollection CLASS [BEGIN] === ---
	/**
	 * @constructor
	 */
	var HTMLPropertiesCollection = global["HTMLPropertiesCollection"] = function () {
		var thisObj = this;

	/* PUBLICK */	
		thisObj["length"] = 0;
		//It's also possible to get a list of all the property names using the object's names IDL attribute.
		//http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api
		thisObj["names"] = [];
	}
	/**
	 * Non-standart (not in vative HTMLPropertiesCollection class) method
	 * @param {Element} newNode DOM-element to add
	 * @param {string|Node} prop_value Microdata-property value
	 * @param {string} name Microdata-property name
	 */
	HTMLPropertiesCollection.prototype._push = function(newNode, prop_value, name) {
		var thisObj = this;
		
		thisObj[thisObj["length"]++] = newNode;
		
		if(!~thisObj["names"].indexOf(name)) {
			thisObj["names"].push(name);
		}
		(
			thisObj[name] || (thisObj[name] = new PropertyNodeList())
		)._push(newNode, prop_value);
	}
	/**
	 * @param {string} p_name property name
	 * @return {PropertyNodeList}
	 *TODO:: Check for compliance with FINALE Microdata specification.
	 */
	HTMLPropertiesCollection.prototype["namedItem"] = function(p_name) {
		return this[p_name] instanceof PropertyNodeList ? this[p_name] : new PropertyNodeList();
	}
	/**
	 * @return {string}
	 */
	HTMLPropertiesCollection.prototype.toString = function() {
		return "[object HTMLPropertiesCollection]";
	}
	/**
	 * @param {number} index of item
	 * @return {Element} 
	 */
	HTMLPropertiesCollection.prototype["item"] = PropertyNodeList.prototype["item"] = function(_index) {
		var thisObj = this;
		
		if(isNaN(_index))_index = 0;
		
		return thisObj[_index] || null;
	}
// --- === HTMLPropertiesCollection CLASS [END] === ---
	}

	/**
	 * Compares the document position of two elements.
	 * MIT Licensed, John Resig: http://ejohn.org/blog/comparing-document-position/
	 *
	 * @param {!Element} a Element to compare with b.
	 * @param {!Element} b Element to compare against a.
	 */
	function compareDocumentPosition(a, b) {
		return a.compareDocumentPosition ?
			a.compareDocumentPosition(b) :
			a.contains ?
				(a != b && a.contains(b) && 16) +
				(a != b && b.contains(a) && 8) +
				(a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
					(a.sourceIndex < b.sourceIndex && 4) +
					(a.sourceIndex > b.sourceIndex && 2) :
				1) +
			0 : 0;
	};
	
	/**
	 * Returns the properties for the given item.
	 *
	 * @param {Element} item The item for which to find the properties.
	 * @return {HTMLPropertiesCollection} The properties for the item.
	 */
	function getProperties(item) {
		var root = item,
			pending = [],
			props = [],
			properties = new HTMLPropertiesCollection(),
			references = [],
			children,
			current;

		_toArray(root.childNodes).forEach(function(el) {
			if(el.nodeType === 1)pending.push(el)
		});
		
		if(root.getAttribute("itemref")) {
			references = root.getAttribute("itemref").trim().split(/\s+/);

			references.forEach(function(reference) {
				var element = document.getElementById(reference);

				if(element)pending.push(element);
			});
		}

		pending = pending.filter(function(candidate, index) {
			var scope = null,
				parent = candidate,
				ancestors = [];

			// Remove duplicates
			if (pending.indexOf(candidate) !== index &&
				pending.indexOf(candidate, index) !== -1)
				return false;

			while((parent = parent.parentNode) !== null && parent.nodeType === 1) {
				ancestors.push(parent);
				if(parent.getAttribute("itemscope") !== null) {
					scope = parent;
					break;
				}
			}

			if (scope !== null) {
				// If one of the other elements in pending is an ancestor element of
				// candidate, and that element is scope, then remove candidate from
				// pending.
				if (pending.indexOf(scope) !== -1)return false;

				// If one of the other elements in pending is an ancestor element of
				// candidate, and either scope is null or that element also has scope
				// as its nearest ancestor element with an itemscope attribute
				// specified, then remove candidate from pending.
				return !ancestors.some(function(ancestor) {
					var elementIndex = -1,
						elementParent,
						elementScope = null;

					// If ancestor is in pending
					if ((elementIndex = pending.indexOf(ancestor)) !== -1) {
						elementParent = pending[elementIndex];

						// Find the nearest ancestor element with an itemscope attribute
						while((elementParent = elementParent.parentNode) !== null &&
							   elementParent.nodeType === 1) {
							if (elementParent.getAttribute("itemscope") !== null) {
								elementScope = elementParent;
								break;
							}
						}
						// The nearest ancestor element equals scope
						if (elementScope === scope)return true;
					}
					return false;
				});
			}
			
			return true;
		});

		pending.sort(function(a, b) {
			return 3 - (compareDocumentPosition(b, a) & 6);
		});

		while((current = pending.pop())) {
			if(current.getAttribute("itemprop")) {
				props.push(current);

				// This is a necessary deviation from the normal algorithm because
				// we can not modify the Element prototype in IE7, so we recursively
				// calculate the properties for each property that has an itemscope.
				if(current.getAttribute("itemscope") !== null) {
					current['itemScope'] = true;
					current['properties'] = getProperties(current);
				}
			}
			
			if (current.getAttribute("itemscope") === null) {
				// Push all the child elements of current onto pending, in tree order
				// (so the first child of current will be the next element to be
				// popped from pending).
				children = _toArray(current.childNodes).reverse();
				children.forEach(function(child) {
					if (child.nodeType === 1)pending.push(child);
				});
			}
		}
				
		
		props.forEach(function(property) {
			var p_names = property.getAttribute("itemprop").split(" "),
				prop_value = MicrodataJS["getItemValue"](property);
			
			property["itemValue"] = prop_value;
			//The itemprop attribute, if specified, must have a value that is an unordered set of unique space-separated tokens representing the names of the name-value pairs that it adds. The attribute's value must have at least one token.
			(property["itemProp"] = p_names)			
				.forEach(properties._push.bind(properties, property, prop_value));
		});

		return properties;
	}
	
	var _CACHE = {};
	
	/**
	 * Gets all of the elements that have an itemType
	 * @param {string} itemTypes - whitespace-separated string of types to match
	 */
	document["getItems"] = function (itemTypes) {
		var _itemTypes = itemTypes || "";//default value
	
		var items = _CACHE[itemTypes] || (_CACHE[itemTypes] = $$("[itemscope]")),
			matches = [];
		
		_itemTypes = _itemTypes.trim().split(/\s+/);
		for (var j = 0, l1 = _itemTypes.length ; j < l1 ; ++j)_CACHE[_itemTypes[j]] = items;
		
		for (var i = 0, l = items.length ; i < l ; ++i) {
			var node = items[i],
				type = node.getAttribute('itemtype');
				
			if((!_itemTypes || ~_itemTypes.indexOf(type)) &&
				!node.getAttribute("itemprop") && //Item can't contain itemprop attribute
				(!("itemScope" in node) || node["itemScope"])) {//writing to the itemScope property must affect whether the element is returned by getItems
				matches.push(MicrodataJS["fixItemElement"](node));
				
				//node.toJSON = microdata_toJSON;//TODO
			}
		}
		
		return matches;
	}
	
	if(global["DocumentFragment"] && global["DocumentFragment"].prototype) {
		global["DocumentFragment"].prototype["getItems"] = document["getItems"];
	}
	else {//IE < 8
		var msie_CreateDocumentFragment = function() {
			var df = msie_CreateDocumentFragment.orig.call(d);
			df["getItems"] = document["getItems"];
			return df;
		}
		msie_CreateDocumentFragment.orig = document.createDocumentFragment;
		
		document.createDocumentFragment = msie_CreateDocumentFragment;
	}
})
: (
// 2. Microdata supported
	function fixPrototypes(global) {
		if(fixPrototypes.isfixed)return;
		
		var MicrodataJS = global["MicrodataJS"];

		if(global["DocumentFragment"] && global["DocumentFragment"].prototype) {
			global["DocumentFragment"].prototype["getItems"] = document["getItems"];
		}
		
		MicrodataJS["fixItemElement"] = function(val) { return val }
		
		//Check implementation of "values" property in PropertyNodeList in browser that support Microdata
		//Тут http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api (search: values)
		//TODO:: Check for compliance with FINALE Microdata specification.
		if(!global["PropertyNodeList"]) {
			global.addEventListener("DOMContentLoaded", fixPrototypes.bind(global, global), false),
				global.addEventListener("load", fixPrototypes.bind(global, global), false)
		}
		else if(!("values" in global["PropertyNodeList"].prototype)) {
			global["PropertyNodeList"].prototype.__defineGetter__("values", function() {
				return this["getValues"]();
			});
			fixPrototypes.isfixed = true;
		}
	}
))
(
	window,
	function(selector) {return window["$$"] ? window["$$"](selector) : Array.prototype.slice.apply(document.querySelectorAll(selector))},//Youre own function(){return toArray(querySelectorAll(#selector#))} function
	function(iterable) {return window["$A"] ? window["$A"](iterable) : Array.prototype.slice.apply(iterable)}//Youre own toArray function
)
