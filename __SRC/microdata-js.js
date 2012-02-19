// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level VERBOSE
// @jscomp_warning missingProperties
// @output_file_name microdata-js.js
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
 * @version 4
 * 
 * @required:
 *  1. Utils.Dom.DOMStringCollection (DOMSettableTokenList like object)
 */

/** @define {boolean} */
var INCLUDE_EXTRAS = true;//Set it ti 'true' if you need Extra behaviors
 
;(function(global, fixPrototypes) {

"use strict";
var _formElements = ['INPUT', 'TEXTAREA', 'PROGRESS', 'METER', 'SELECT', 'OUTPUT'],
	_multimediaElement = ['AUDIO', 'EMBED', 'IFRAME', 'IMG', 'SOURCE', 'TRACK', 'VIDEO'],
	_linkElement = ["A","AREA","LINK"],
	_throwDOMException = function(errStr) {
		var ex = Object.create(DOMException.prototype);
		ex.code = DOMException[errStr];
		ex.message = errStr +': DOM Exception ' + ex.code;
		throw ex;
	},
	__itemValueProperty = {
		"get" : function() {
			var element = this,
				elementName = element.nodeName;

			return element.getAttribute("itemscope") !== null ? element :
				element.getAttribute("itemprop") === null ? null :
				
				INCLUDE_EXTRAS && (~_formElements.indexOf(elementName)) ? element.value ://Non-standart !!!
				
				elementName === "META" ? element.content :
				~_multimediaElement.indexOf(elementName) ? element.src :
				~_linkElement.indexOf(elementName) ? element.href :
				elementName === "OBJECT" ? element.data :
				elementName === "TIME" && element.getAttribute("datetime") ? element.dateTime ://TODO:: Check element.dateTime in IE[7,6]
				"textContent" in element ? element.textContent :
					element.innerText;//IE-only fallback
		},
		"set" : function(value) {
			var element = this,
				elementName = element.nodeName;

			if(element.getAttribute("itemprop") === null) {
				//TODO:: check it. If no test pass return this: throw new global["Utils"]["Dom"]["DOMException"]("INVALID_ACCESS_ERR")						
			
				_throwDOMException("INVALID_ACCESS_ERR");
			}

			return element[
				INCLUDE_EXTRAS && (~_formElements.indexOf(elementName)) ? "value" ://Non-standart !!!
				
				elementName === 'META' ? "content" :
				~_multimediaElement.indexOf(elementName) ? "src" :
				~_linkElement.indexOf(elementName) ? "href" :
				elementName === 'OBJECT' ? "data" :
				elementName === 'TIME' && element.getAttribute('datetime') ? "dateTime" ://TODO:: Check element.dateTime in IE[7,6]
				"innerHTML"] = value;
		}
	};

if(INCLUDE_EXTRAS) {
	fixPrototypes.__itemValueProperty = __itemValueProperty;
	fixPrototypes._formElements = _formElements;
}
	
(
!document["getItems"] ?
// 1. Microdata unsupported
	/**
	 * @param {Window|Object} global The global object
	 */
	function(global) {
		//import
		var DOMStringCollection_ = global["Utils"]["Dom"]["DOMStringCollection"];
		
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
			 * Non-standart (not in native PropertyNodeList class) method
			 * @param {Element} newNode DOM-element to add
			 */
			PropertyNodeList.prototype["_push"] = function(newNode, prop_value) {
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
			 * @type {undefined}
			 * For compliance with real PropertyNodeList.prototype
			 */
			PropertyNodeList.prototype["values"] = void 0;
			/**
			 * @return {Array}
			 */
			PropertyNodeList.prototype["getValues"] = function() {
				var _value = [], k = -1, el;
				
				while(el = this[++k])
					_value.push(el["itemValue"]);
				
				return this["values"] = _value;//Update `values`
			}
			/**
			 * @return {string}
			 */
			PropertyNodeList.prototype.toString = function() {
				return "[object PropertyNodeList]";
			}
			
		// --- === PropertyNodeList CLASS [END] and method PropertyNodeList.prototype["item"] below === ---
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
			 * Non-standart (not in native HTMLPropertiesCollection class) method
			 * Clear HTMLPropertiesCollection
			 */
			HTMLPropertiesCollection.prototype._clear = function() {
				var thisObj = this;
				
				for(var i in thisObj)
					if(thisObj[i] instanceof PropertyNodeList) {
						thisObj[i] = null;
						delete thisObj[i];
					}
				
				thisObj["length"] = 0;
				thisObj["names"] = [];
			}
			
			/**
			 * Non-standart (not in native HTMLPropertiesCollection class) method
			 * @param {Element} newNode DOM-element to add
			 * @param {string|Node} prop_value Microdata-property value
			 * @param {string} name Microdata-property name
			 */
			HTMLPropertiesCollection.prototype["_push"] = function(newNode, prop_value, name) {
				var thisObj = this;
				
				thisObj[thisObj["length"]++] = newNode;
				
				if(!~thisObj["names"].indexOf(name)) {
					thisObj["names"].push(name);
				};
				
				(
					thisObj[name] || (thisObj[name] = new PropertyNodeList())
				)["_push"](newNode, prop_value);
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


		// ------- Extending Element.prototype ---------- //
		// For IE < 8 support use microdata-js.ielt8.js and microdata-js.ielt8.htc

		
		// Definition IF < 8 support
		var _HTMLElement_prototype = (global["HTMLElement"] && global["HTMLElement"].prototype || /*ie8*/global["Element"] && global["Element"].prototype);
		if(_HTMLElement_prototype)Object.defineProperties(_HTMLElement_prototype, {
			"itemValue" : __itemValueProperty,
			"itemProp" : {
				"get" : function() {
					var itempropValue = this.getAttribute("itemprop"),
						thisObj = this;
					
					if(!thisObj["_"])thisObj["_"] = {};
					
					if(!thisObj["_"].lastitemprop) {
						thisObj["_"].lastitemprop = new DOMStringCollection_(itempropValue, function() {
							thisObj.setAttribute("itemprop", this + "");
						});
					}
					else if(itempropValue !== null && thisObj["_"].lastitemprop + "" !== itempropValue) {
						thisObj["_"].lastitemprop.update(itempropValue);
					}
					
					return thisObj["_"].lastitemprop;
				},
				"set" : function(val) {
					return this.setAttribute("itemprop", val)
				}
			},
			"itemScope" : {
				"get" : function() {
					return this.getAttribute("itemscope") !== null
				}, 
				"set" : function(val) {
					val ? this.setAttribute("itemscope", "") : this.removeAttribute("itemscope");
					
					//val === true && MicrodataJS.fixItemElement(this);
					
					return val;
				}
			},
			"itemId" : {
				"get" : function() {
					var val = (this.getAttribute("itemid") || "").trim();
					
					if(val && !/\w+:(\/\/)?[\w][\w.\/]*/.test(val))val = location.href.replace(/\/[^\/]*$/, "/" + escape(val));
					
					return val;
				},
				"set" : function(val) {
					return this.setAttribute("itemid", val + "")
				}
			},
			"itemType" : {
				"get" : function() {
					return (this.getAttribute("itemtype") || "")
				},
				"set" : function(val) {
					return this.setAttribute("itemtype", val + "")
				}
			},
			"itemRef" : {
				"get" : function() {
					var itemrefValue = this.getAttribute("itemref"),
						thisObj = this;
					
					if(!thisObj["_"])thisObj["_"] = {};
					
					if(!thisObj["_"].lastitemref) {
						thisObj["_"].lastitemref = new DOMStringCollection_(itemrefValue, function() {
							thisObj.setAttribute("itemref", this + "");
						});
					}
					else if(itemrefValue !== null && thisObj["_"].lastitemref + "" !== itemrefValue) {
						thisObj["_"].lastitemref.update(itemrefValue);
					}
					
					return thisObj["_"].lastitemref;
					
				},
				"set" : function(val) {
					return this.setAttribute("itemref", val + "")
				}
			},
			"properties" : {
				"get" : function() {
					var thisObj = this;
					
					if(!thisObj["_"])thisObj["_"] = {};					
					
					var properties = thisObj["_"]._properties_CACHE__;
					
					if(properties) {
						if(!global["microdata_liveProperties"])return properties;
						else properties._clear();
					}
					else properties = thisObj["_"]._properties_CACHE__ = new HTMLPropertiesCollection();
					
					var pending = [],
						props = [],
						references = [],
						current,
						k = -1,
						el;

					while(el = thisObj.childNodes[++k])
						if(el.nodeType === 1)pending.push(el);
					
					if(thisObj.getAttribute("itemref")) {
						references = thisObj.getAttribute("itemref").trim().split(/\s+/);

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
						return 3 - (b.compareDocumentPosition(a) & 6);
					});

					while((current = pending.pop())) {
						if(current.getAttribute("itemprop")) {
							props.push(current);
						}
						
						if (current.getAttribute("itemscope") === null) {
							// Push all the child elements of current onto pending, in tree order
							// (so the first child of current will be the next element to be
							// popped from pending).
							k = current.childNodes.length;
							while(el = current.childNodes[--k])
								if(el.nodeType === 1)pending.push(el);
						}
					}
							
					
					props.forEach(function(property) {
						//The itemprop attribute, if specified, must have a value that is an unordered set of unique space-separated tokens representing the names of the name-value pairs that it adds. The attribute's value must have at least one token.
						k = -1;
						current = property["itemProp"];
						while(el = current[++k])
							properties["_push"](property, property["itemValue"], el);
					});

					return properties;
				}
					
					
			}
		});
		
		//[BUG] Prevent bug in Google Chrome:: setter do not fire on first created EMBED element
		try {
			var EMBED = document.createElement("EMBED");
			EMBED["itemProp"] = "t";
			EMBED["itemValue"] = EMBED["itemValue"] + "1";
		}
		catch(e) {}

		/**
		 * Gets all of the elements that have an itemType
		 * @param {string} itemTypes - whitespace-separated string of types to match
		 * @this {Document|DocumentFragment}
		 */
		document["getItems"] = function(itemTypes) {
		
			/*
			var selector=itemTypes.split(" ").map(function(t){
				return '[itemtype~="'+t.replace(/"/g, '\\"')+'"]'
			})
			*/
			
			/*
			"Redefine itemtype='' to allow multiple types if they share the same vocabulary"
			http://html5.org/tools/web-apps-tracker?from=6667&to=6668
			
			Эта версия поддерживает несколько значений в itemType. Например: <div id="test" itemscope itemtype="f.ru/test1 f.ru/test2">,  document.getItems("f.ru/test1") - бедет найден div#test
			Но похоже, что Opera 12 не поддерживает несколько значений в itemType :( TODO:: выяснить, как в спецификации
			
			var items = 
					//Не работает в ie6!!! (browser.msie && browser.msie < 8) ? $$(".__ielt8_css_class_itemscope__", this) ://Only for IE < 8 for increase performance //requared microdata-js.ielt8.htc
						$$("[itemscope]", this),
				matches = [],
				_itemTypes = (itemTypes || "").trim().split(/\s+/),
				node,
				i = -1;
			
			while(node = items[++i]) {
				var typeString = node.getAttribute('itemtype') || "",
					types = typeString.split(/\s+/),
					_curType,
					accept;
				
				accept = !(typeString &&
					!node.getAttribute("itemprop") && //Item can't contain itemprop attribute
						(!("itemScope" in node) || node["itemScope"]));//writing to the itemScope property must affect whether the element is returned by getItems;
				
				while(_curType = types.pop() && !accept)
					(accept = !~_itemTypes.indexOf(_curType)) &&
						matches.push(node);
			}*/
		
		
			var isitemTypes = !!itemTypes,
				_itemTypes = (itemTypes || "").trim().split(/\s+/);
			
			
			var items = document.querySelectorAll("[itemscope]"),
				matches = [];

			for(var i = 0, l = items.length ; i < l ; ++i) {
				var node = items[i],
					type = node.getAttribute('itemtype');

				if((!isitemTypes || ~_itemTypes.indexOf(type)) &&
					!node.getAttribute("itemprop") && //Item can't contain itemprop attribute
					(!("itemScope" in node) || node["itemScope"])) {//writing to the itemScope property must affect whether the element is returned by getItems
					matches.push(node);
				}
			}
			
			return matches;
		}
		
		//Fixing
		if(INCLUDE_EXTRAS)fixPrototypes(global);
	}
: INCLUDE_EXTRAS && fixPrototypes// 2. Microdata supported
)
(global)
})
(
	window,
	
	/**
	 * Fix Microdata Item Element for browsers with no Microdata support
	 * @param {Window} global
	 */
	INCLUDE_EXTRAS && function fixPrototypes(global) {
		//if(fixPrototypes.isfixed)return;
		if(global["__prot_fix__isfixed"])return;
		
		/* too difficult
		//Adding toJSON function
		if(!fixPrototypes.new_getItems) {
			fixPrototypes.new_getItems = function() {
				var result = new_getItems.orig.apply(this, arguments);
				
				result.forEach(function(el) {
					//el.toJSON = some_toJSON_function
				})
			}
			fixPrototypes.new_getItems.orig = document["getItems"];
			
			document["getItems"] = fixPrototypes.new_getItems;
		}*/
		
		function itemToJSON(itemElement) {
			var result,
				i = -1,
				cur;
			
			if(itemElement.length !== void 0) {
				result = {"items" : []};
				
				while(cur = itemElement[++i]) {
					if(cur.getAttribute("itemscope") !== null)//hasAttribute
						result["items"].push(itemToJSON(cur))
				}
				
				return result;
			}
			
			if(itemElement.getAttribute("itemscope") !== null) {//hasAttribute
				result = {};
				
				var val;
				
				if(val = itemElement.getAttribute("itemid"))
					result['id'] = val;

				if(val = itemElement.getAttribute("itemtype"))
					result['type'] = val;
				
				result["properties"] = itemElement["properties"].toJSON();
			}
			
			return result;
		}
		
		var _a;
		
		if(!(_a = global["PropertyNodeList"])) {
			//Strange behavior in Opera 12 - HTMLPropertiesCollection and PropertyNodeList  constructors available only when it realy need - when <el>.property and <el>.property[<prop_name>]
			// http://jsfiddle.net/EVmfh/
			
			var orig = HTMLDocument.prototype["getItems"];
			/**
			 * @this {(HTMLDocument|DocumentFragment)}
			 */
			HTMLDocument.prototype["getItems"] = function() {
				var test_div = document.createElement("div");
				test_div.innerHTML = "<p itemprop='t'>1</p>";
				test_div["itemScope"] = true;
				test_div["properties"]["t"][0].innerHTML = "2";
				
				//DEBUG:: 
				//console.log((this.defaultView || global).location.href)
				
				//If 'this' is not DocumentFragment, and 'this' is a docuemnt in iFrame defaultView would be exsist
				fixPrototypes(this.defaultView || global);//Extend prototype's
				
				return (this["getItems"] = orig).apply(document, arguments)
			}
		}
		else {
			var _PropertyNodeList = global["PropertyNodeList"];
			if(!(_a = _PropertyNodeList.prototype).toJSON)_a.toJSON = function() {
				var thisObj = this,
					result = [],
					values = thisObj["values"],
					i = -1,
					cur;
				
				while((cur = values[++i]) != null) {
					if(cur instanceof Element) {
						cur = itemToJSON(cur);//if cur is not Microdata element return undefined
					}
					result.push(cur);
				}
				
				return result;
			}
			
			var test_input = document.createElement("input");
			test_input["itemProp"] = "t";
			test_input.value = "1";
			if(test_input.value != test_input["itemValue"]) {
				fixPrototypes._formElements.forEach(function(_tagName) {
					if(_tagName == "TEXTAREA")_tagName = "TextArea";
					else _tagName = _tagName.charAt(0).toUpperCase() + _tagName.substring(1).toLowerCase();//INPUT -> Input
					var _proto = global["HTML" + _tagName + "Element"];
					if(_proto = _proto.prototype)
						Object.defineProperty(_proto, "itemValue", fixPrototypes.__itemValueProperty);
				})
				//_a === global["PropertyNodeList"].prototype
				_a["getValues"] = function() {//New `getValues` function worked for "Form Elements"
					var result = [], k = -1, el;
					
					while(el = this[++k])
						result.push(el["itemValue"]);
					
					return result;
				}
				//TODO:: fix PropertyNodeList.values & PropertyNodeList.getValues()
			}
			
			//Check implementation of "values" property in PropertyNodeList in browser that support Microdata
			//Тут http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api (search: values)
			//TODO:: Check for compliance with FINALE Microdata specification.
			if(!("values" in _a)) {//_a === global["PropertyNodeList"]
				_a.__defineGetter__("values", //_a === global["PropertyNodeList"].prototype
					_a["getValues"]
				);
			}
			
			_a = global["HTMLPropertiesCollection"];
			if(!(_a = _a.prototype).toJSON)_a.toJSON = function() {
				var thisObj = this,
					result = {},
					names = thisObj["names"],
					i = -1,
					cur;
				
				while(cur = names[++i])
					if(thisObj[cur] instanceof _PropertyNodeList)
						result[cur] = thisObj[cur].toJSON();
			
				return result;
			}
		
			fixPrototypes.isfixed = true;
		}
		
		if(!fixPrototypes.fixedDocumentFragment) {
			//Fix DocumentFragment
			
			//IE < 9 has no DocumentFragment so it should be shimd (but not in this lib)
			if((_a = global["DocumentFragment"]) && (_a = _a.prototype)) {//_a === global["DocumentFragment"]
				if(!_a["getItems"])_a["getItems"] = document["getItems"];//_a === global["DocumentFragment"].prototype
			}
					
			fixPrototypes.fixedDocumentFragment = true;
		}
	}
);