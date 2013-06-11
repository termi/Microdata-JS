/** @license Microdata API polyfill | @version 0.6.1 | MIT License | github.com/termi */

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
 * @version 6.0
 * 
 * @required:
 *  1. INCLUDE_DOMSTRINGCOLLECTION=true or window.DOMStringCollection (DOMSettableTokenList like object)
 */

// [[[|||---=== GCC DEFINES START ===---|||]]]
/** @define {boolean} */
var __GCC__INCLUDE_EXTRAS__ = true;//Set it to 'true' if you need Extra behaviors
/** @define {boolean} */
var __GCC__INCLUDE_DOMSTRINGCOLLECTION__ = true;
// [[[|||---=== GCC DEFINES END ===---|||]]]

"use strict";

(function(global) {
	var
		DOMStringCollection
		/**
		 * Fix Microdata Item Element for browsers with Microdata support
		 * @param {(Object|Window)} global
		 */
	  , fixPrototypes

		, inherit_HTMLPropertyCollection_and_PropertyNodeList_from_Array

	  , _formElements = {'INPUT' : null, 'TEXTAREA' : null, 'PROGRESS' : null, 'METER' : null, 'SELECT' : null, 'OUTPUT' : null}

	  , _multimediaElement = {'AUDIO' : null, 'EMBED' : null, 'IFRAME' : null, 'IMG' : null, 'SOURCE' : null, 'TRACK' : null, 'VIDEO' : null}

	  , _linkElement = {"A" : null, "AREA" : null, "LINK" : null}

	  , _throwDOMException = function(errStr) {
			var ex = Object.create(DOMException.prototype);
			ex.code = DOMException[errStr];
			ex.message = errStr +': DOM Exception ' + ex.code;
			throw ex;
		}

	  , __itemValueProperty = {
			"get" : function() {
				var element = this,
					elementName = element.nodeName;

				return element.getAttribute("itemscope") !== null ? element :
					element.getAttribute("itemprop") === null ? null :

					__GCC__INCLUDE_EXTRAS__ && elementName in _formElements ? element.value ://Non-standart !!!

					elementName === "META" ? element.content :
					elementName in _multimediaElement ? element.src :
					elementName in _linkElement ? element.href :
					elementName === "OBJECT" ? element.data :
					elementName === "TIME" && element.getAttribute("datetime") ? element.dateTime ://TODO:: Check element.dateTime in IE[7,6]
					"textContent" in element ? element.textContent :
						element.innerText;//IE-only fallback
			},
			"set" : function(value) {
				var element = this,
					elementName = element.nodeName;

				if(element.getAttribute("itemprop") === null) {
					//TODO:: check it. If no test pass return this: throw new global["DOMException"]("INVALID_ACCESS_ERR")

					_throwDOMException("INVALID_ACCESS_ERR");
				}

				return element[
					__GCC__INCLUDE_EXTRAS__ && elementName in _formElements ? "value" ://Non-standart !!!

					elementName === 'META' ? "content" :
					elementName in _multimediaElement ? "src" :
					elementName in _linkElement ? "href" :
					elementName === 'OBJECT' ? "data" :
					elementName === 'TIME' && element.getAttribute('datetime') ? "dateTime" ://TODO:: Check element.dateTime in IE[7,6]
					"innerHTML"] = value;
			}
		}

	  , get__DOMStringCollection_property = function(thisObj, attributeName) {
			if(!thisObj["_"])thisObj["_"] = {};
			var value = thisObj.getAttribute(attributeName),
				_ = thisObj["_"]["_mcrdt_"] || (thisObj["_"]["_mcrdt_"] = {}),
				_currentValue = _[attributeName];

			if(!_currentValue) {
				_currentValue = _[attributeName] = new DOMStringCollection(function() {
					return thisObj.getAttribute(attributeName);
				}, function(value) {
					thisObj.setAttribute(attributeName, value);
				}, thisObj);
			}
			else if(value !== null && _currentValue + "" !== value) {
				//touche DOMStringCollection to force update
				_currentValue["contains"]("fake");
			}

			return _currentValue;
		}

	  , __itemTypeProperty = {
			"get" : function() {
				return get__DOMStringCollection_property(this, "itemtype")
			},
			"set" : function(val) {
				return this.setAttribute("itemtype", val + ""), val
			}
		}

		/**
		 * Gets all of the elements that have an itemType
		 * @param {string} itemTypes - whitespace-separated string of types to match
		 * @this {Document|DocumentFragment}
		 */
	  , __getItems__ = function(itemTypes) {
			if( itemTypes ) {
				itemTypes = String(itemTypes).trim();
			}

			return _Array_from(this.querySelectorAll(itemTypes ? itemTypes.split(/\s+/).map(function(_itemType) {
				return "[itemscope][itemtype~='" + _itemType + "']"
			}).join(",") : "[itemscope]")).filter(function(node) {
					return !node.getAttribute("itemprop"); //Item can't contain itemprop attribute
				})
		}

	  , fixPrototypes_isfixed

	  , fixPrototypes_fixedDocumentFragment

		, tmp

	  , HTMLDocument_prototype = (tmp = (global.HTMLDocument || global.Document)) && tmp.prototype

	  , hasNative_getItems = "getItems" in document

		, _Array_from = Array["from"] || Function.prototype.call.bind(Array.prototype.slice)
	;

	if(__GCC__INCLUDE_DOMSTRINGCOLLECTION__) {
		var _append = function(obj, ravArgs) {
			for(var i = 1; i < arguments.length; i++) {
				var extension = arguments[i];
				for(var key in extension)
					if(Object.prototype.hasOwnProperty.call(extension, key) &&
						(!Object.prototype.hasOwnProperty.call(obj, key))
						)obj[key] = extension[key];
			}

			return obj;
		};

		var _String_contains_ = String.prototype["contains"] || function(substring, fromIndex) {
			fromIndex = fromIndex != void 0 ? /*Number["toInteger"]*/!isNaN(fromIndex) : 0;
			return !!~this.indexOf(substring, fromIndex);
		};


		var _classList_toggle = function(token, forse) {
			token += "";
			var thisObj = this
				, result = thisObj.contains(token)
				, method = result ?
					forse !== true && "remove"
					:
					forse !== false && "add"
				;

			if(method)this[method](token);

			return result;
		};

		/** @type {RegExp} @const */
		var RE_DOMSettableTokenList_lastSpaces = /\s+$/g;
		/** @type {RegExp} @const */
		var RE_DOMSettableTokenList_spaces = /\s+/g;

		var _unsafe_Function_bind_ = Function.prototype.bind;
		var _String_split_ = String.prototype.split;
		var _String_trim_ = String.prototype.trim;

		/**
		 * DOMStringCollection
		 * DOMSettableTokenList like object
		 * http://www.w3.org/TR/html5/common-dom-interfaces.html#domsettabletokenlist-0
		 * @param {Function} getter callback for onchange event
		 * @param {Function} setter callback for onchange event
		 * @param {Object} object_this context of onchange function
		 * @constructor
		 */
		DOMStringCollection = function(getter, setter, object_this) {
			/**
			 * Event fired when any change apply to the object
			 */
			this["__getter__"] = _unsafe_Function_bind_.call(getter, object_this);
			this["__setter__"] = _unsafe_Function_bind_.call(setter, object_this);
			this["length"] = 0;
			this["value"] = "";

			this.DOMStringCollection_check_currentValue();
		};
		/**
		 * @param {DOMStringCollection} thisObj
		 * @param {string} _string
		 */
		var DOMStringCollection_init = function(thisObj, _string) {
			var string = _string || ""//default value
				, isChange = !!thisObj.length
			;

			if(isChange) {
				while(thisObj.length > 0) {
					delete thisObj[--thisObj.length];
				}

				thisObj["value"] = "";
			}

			if(string) {
				if(string = _String_trim_.call(string)) {
					_String_split_.call(string, RE_DOMSettableTokenList_spaces).forEach(DOMStringCollection_init.add, thisObj);
				}
				thisObj["value"] = _string;//empty value should stringify to contain the attribute's whitespace
			}

			if(isChange && thisObj["__setter__"])thisObj["__setter__"](thisObj["value"]);
		};
		/**
		 * @param {string} token
		 * @this {DOMStringCollection}
		 */
		DOMStringCollection_init.add = function(token) {
			this[this.length++] = token;
		};

		_append(DOMStringCollection.prototype, /** @lends {DOMStringCollection.prototype} */{
			DOMStringCollection_check_currentValue : function() {
				var string = this["__getter__"]();
				if(string !== this["value"]) {
					DOMStringCollection_init(this, string);
				}
			},
			DOMStringCollection_check_Token_and_argumentsCount : function(token, argumentsCount) {
				if(argumentsCount === 0) {
					_throwDOMException("WRONG_ARGUMENTS_ERR");
				}

				if(token === "")_throwDOMException("SYNTAX_ERR");
				if(RE_DOMSettableTokenList_spaces.test(token))_throwDOMException("INVALID_CHARACTER_ERR");
			},
			"add": function() {
				var tokens = arguments
					, i = 0
					, l = tokens.length
					, token
					, thisObj = this
					, currentValue
					, prevValue
					, updated = false
				;

				this.DOMStringCollection_check_currentValue();
				this.DOMStringCollection_check_Token_and_argumentsCount(null, l);

				currentValue = thisObj["value"];
				prevValue = " " + currentValue + " ";

				do {
					token = tokens[i] + "";

					this.DOMStringCollection_check_Token_and_argumentsCount(token);

					if( !_String_contains_.call(prevValue, " " + token + " ") ) { // not contains
						currentValue += ((i > 0 || currentValue && !currentValue.match(RE_DOMSettableTokenList_lastSpaces) ? " " : "") + token);

						this[this.length++] = token;

						updated = true;
					}
				}
				while(++i < l);

				if( updated ) {
					thisObj["value"] = currentValue;
					if(thisObj["__setter__"])thisObj["__setter__"](thisObj["value"]);
				}
			},
			"remove": function() {
				var tokens = arguments
					, i = 0
					, l = tokens.length
					, token
					, thisObj = this
					, currentValue
					, currentValueLength
					, itemsArray
					, newItemsArray = []
					, filterObject = {}
				;

				this.DOMStringCollection_check_currentValue();
				this.DOMStringCollection_check_Token_and_argumentsCount(null, l);

				currentValue = thisObj["value"];
				currentValueLength = currentValue.length;

				do {
					token = tokens[i] + "";

					this.DOMStringCollection_check_Token_and_argumentsCount(token);

					filterObject[token] = null;
				}
				while(++i < l);

				itemsArray = _String_split_.call(currentValue, " ");
				currentValue = "";
				for(i = 0, l = itemsArray.length ; i < l ; ++i) {
					if(!((token = itemsArray[i]) in filterObject)) {
						newItemsArray.push(token);
						currentValue += ((i ? " " : "") + token);
					}
				}

				if( currentValueLength !== currentValue.length ) {
					for(i = thisObj.length - 1 ; i >= 0 ; --i) {
						if(!(thisObj[i] = newItemsArray[i])) {
							thisObj.length--;
							delete thisObj[i];
						}
					}

					thisObj["value"] = currentValue;
					if(thisObj["__setter__"])thisObj["__setter__"](thisObj["value"]);
				}
			},
			"contains": function(token) {
				this.DOMStringCollection_check_Token_and_argumentsCount(token, arguments.length);
				this.DOMStringCollection_check_currentValue();

				return _String_contains_.call(" " + this["value"] + " ", " " + token + " ");
			},
			"item": function(index) {
				this.DOMStringCollection_check_currentValue();

				return this[index] || null;
			},
			"toggle": _classList_toggle
		});

		DOMStringCollection.prototype.toString = function() {//_append function do not overwrite Object.prototype.toString
			this.DOMStringCollection_check_currentValue();

			return this["value"] || ""
		};
	}
	else {
		//import
		DOMStringCollection = global["DOMStringCollection"];
	}

	if(__GCC__INCLUDE_EXTRAS__) {
		inherit_HTMLPropertyCollection_and_PropertyNodeList_from_Array = function() {
			// HTMLPropertiesCollection and PropertyNodeList is inherited from NodeList, NodeList inherited from Array

			var _tmp_
				, _Array_prototype_ = Array.prototype
				, _Object_prototype = Object.prototype
			;

			[
				// prototypes
				(_tmp_ = global["PropertyNodeList"]) && _tmp_.prototype
				, (_tmp_ = global["HTMLPropertiesCollection"]) && _tmp_.prototype
			].forEach(function(instance, index) {
					var proto;
					if( index < 3 || (instance && !("map" in instance) && !Array.isArray(instance)) ) {
						if( index < 3 ) {
							proto = instance;
						}
						else {
							//in old FF nodeList_proto.__proto__ != nodeList_proto.constructor.prototype
							proto = instance.__proto__ || instance.constructor && instance.constructor.prototype;
						}

						if( proto && proto !== _Array_prototype_ && proto !== _Object_prototype ) {// Paranoiac mode

							this(proto);
						}
					}
				}, _Array_prototype_.forEach.bind(
					[
						"join", "forEach", "every", "some", "map", "filter", "reduce", "reduceRight", "indexOf", "lastIndexOf", "slice", "contains", "find", "findIndex"
						//index: 14
						, "splice", "concat", "reverse", "push", "pop", "shift", "unshift", "sort"
					]
					//Unsafe:: "splice", "concat", "reverse", "push", "pop", "shift", "unshift", "sort"
					, function(key, index) {
						var value;
						if( !(key in this) && _Array_prototype_[key] ) {
							value = {
								"configurable": true
								, "enumerable": false
								, "writable": true
							};
							if(index < 15) {
								value["value"] = _Array_prototype_[key];
							}
							else {
								value["value"] = function() {
									_throwDOMException("NO_MODIFICATION_ALLOWED_ERR");
								}
							}
							Object.defineProperty(this, key, value);
						}
					}
				)
			);

			tmp = _Array_prototype_ = _Object_prototype = null;
		};

		fixPrototypes = function(global) {

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

			if(!fixPrototypes_isfixed) {
				var _a
				  , test_div = document.createElement("div");

				//[BUGFIX] Prevent bug in Google Chrome:: setter do not fire on first created EMBED element
				try {
					var EMBED = document.createElement("EMBED");
					EMBED["itemProp"] = "t";
					EMBED["itemValue"] = EMBED["itemValue"] + "1";
				}
				catch(e) {}

				//[BUGFIX] Fix old Opera Microdata.itemtype implimentation
				// http://html5.org/tools/web-apps-tracker?from=6667&to=6668
				if(hasNative_getItems && HTMLDocument_prototype["getItems"] != __getItems__) {
					test_div["itemScope"] = true;
					test_div["itemType"] = "t";
					if(typeof test_div["itemType"] == "string") {
						Object.defineProperty(global["Element"].prototype, "itemType", __itemTypeProperty);
						HTMLDocument_prototype["getItems"] = __getItems__;//replace wrong implimentation
					}
				}

				if(hasNative_getItems && !(_a = global["PropertyNodeList"])) {
					//Strange behavior in Opera 12 - HTMLPropertiesCollection and PropertyNodeList  constructors available only when it realy need - when <el>.property and <el>.property[<prop_name>]
					// http://jsfiddle.net/EVmfh/
					if(!HTMLDocument_prototype["getItems"]["orig"]) {//prevent refix
						var orig = HTMLDocument_prototype["getItems"];
						/**
						 * @this {(HTMLDocument|DocumentFragment)}
						 */
						HTMLDocument_prototype["getItems"] = function() {
							test_div.innerHTML = "<p itemprop='t'>t</p>";
							test_div["properties"]["t"][0].innerHTML = "t";

							//DEBUG::
							//console.log((this.defaultView || global).location.href)

							//If 'this' is not DocumentFragment, and 'this' is a docuemnt in iFrame defaultView would be exsist
							fixPrototypes(this.defaultView || global);//Extend prototype's

							return (this["getItems"] = orig).apply(document, arguments)
						};
						HTMLDocument_prototype["getItems"]["orig"] = orig;
					}
				}
				else {
					var _PropertyNodeList = global["PropertyNodeList"];

					var isNode = function(obj) {
						return obj && typeof obj == "object" && "nodeType" in obj;
					};

					/**
					 * @this {PropertyNodeList}
					 * @return {Object} json
					 */
					if(!(_a = _PropertyNodeList.prototype).toJSON)_a.toJSON = function() {
						return this["getValues"]().map(function(cur) {
							if( isNode(cur) ) {
								cur = itemToJSON(cur);//if cur is not Microdata element return undefined
							}
							return cur;
						});
					};

					//Fix `itemValue` with FORM elements
					var test_input = document.createElement("input");
					test_input["itemProp"] = "t";
					test_input["itemScope"] = false;
					test_input.value = "1";
					if(test_input.value != test_input["itemValue"]) {
						Object.keys(_formElements).forEach(function(_tagName) {
							if(_tagName == "TEXTAREA")_tagName = "TextArea";
							else _tagName = _tagName.charAt(0).toUpperCase() + _tagName.substring(1).toLowerCase();//INPUT -> Input
							var _proto = global["HTML" + _tagName + "Element"];
							if(_proto && (_proto = _proto.prototype))
								Object.defineProperty(_proto, "itemValue", __itemValueProperty);
						});
						//_a === global["PropertyNodeList"].prototype
						_a["getValues"] = function() {//New `getValues` function worked for "Form Elements"
							var result = [], k = -1, el;

							while(el = this[++k])
								result.push(el["itemValue"]);

							return result;
						};
						//TODO:: fix PropertyNodeList.values & PropertyNodeList.getValues()
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
					};

					inherit_HTMLPropertyCollection_and_PropertyNodeList_from_Array();

					fixPrototypes_isfixed = true;
				}
			}

			if(!fixPrototypes_fixedDocumentFragment) {
				//Fix DocumentFragment

				//IE < 9 has no DocumentFragment so it should be shimd (but not in this lib)
				if((_a = global["DocumentFragment"]) && (_a = _a.prototype)) {//_a === global["DocumentFragment"]
					if(!_a["getItems"])_a["getItems"] = document["getItems"];//_a === global["DocumentFragment"].prototype
				}

				fixPrototypes_fixedDocumentFragment = true;
			}
		};
	}
	else {
		fixPrototypes = function(){ };
	}

	(!hasNative_getItems ?
		// 1. Microdata unsupported
		/**
		 * @param {(Window|Object)} global The global object
		 */
		(function(global) {
			// --- === PropertyNodeList CLASS [BEGIN] === ---
			/**
			 * @constructor
			 */
			var _PropertyNodeList = function () {
				var thisObj = this;

				/* PUBLICK */
				/** @type {number} */
				thisObj["length"] = 0;
			};
			/**
			 * Non-standart (not in native _PropertyNodeList class) method
			 * @param {Element} newNode DOM-element to add
			 */
			_PropertyNodeList.prototype["_push"] = function(newNode) {
				var thisObj = this;

				thisObj[thisObj["length"]++] = newNode;
			};
			_PropertyNodeList.prototype["names"] = [];
			/**
			 * @return {Array}
			 */
			_PropertyNodeList.prototype["getValues"] = function() {
				var _value = [], k = -1, el;

				while(el = this[++k])
					_value.push(el["itemValue"]);

				return _value;
			};
			/**
			 * @return {string}
			 */
			_PropertyNodeList.prototype.toString = function() {
				return "[object PropertyNodeList]";
			};
			// --- === PropertyNodeList CLASS [END] and method PropertyNodeList.prototype["item"] below === ---


			// --- === HTMLPropertiesCollection CLASS [BEGIN] === ---
			function _DOMStringList_item(index) {
				index = +index;

				if( index === NaN )return null;

				return this[index];
			}

			/**
			 * @constructor
			 */
			var _HTMLPropertiesCollection = function () {
				var thisObj = this;

				/* PUBLICK */
				thisObj["length"] = 0;
				//It's also possible to get a list of all the property names using the object's names IDL attribute.
				//http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api
				thisObj["names"] = [];
				// TODO:: "names" should be DOMStringList
				thisObj["names"].item = _DOMStringList_item;
				// thisObj["names"].contains should be in Array
			};

			/**
			 * Non-standart (not in native HTMLPropertiesCollection class) method
			 * Clear _HTMLPropertiesCollection
			 */
			_HTMLPropertiesCollection.prototype._clear = function() {
				var thisObj = this;

				for(var i in thisObj) {
					if(thisObj[i] instanceof _PropertyNodeList || !isNaN(i)) {
						thisObj[i] = null;
						delete thisObj[i];
					}
				}

				thisObj["length"] = 0;
				if( thisObj["names"] && thisObj["names"].splice ) {
					thisObj["names"].splice(0, thisObj["names"].length);
				}
				else {
					thisObj["names"] = [];
				}
			};

			/**
			 * Non-standart (not in native HTMLPropertiesCollection class) method
			 * @param {Element} node DOM-element to add
			 */
			_HTMLPropertiesCollection.prototype["_push"] = function(node) {
				var thisObj = this,
					prop_name = node["itemProp"],
					name,
					k = -1;

				if( !prop_name ) {
					return;
				}

				thisObj[thisObj["length"]++] = node;

				/*if(!~thisObj["names"].indexOf(name)) {
				 thisObj["names"].push(name);
				 };*/


				while( name = prop_name[++k] ) {
					if( !thisObj[name]
						|| thisObj.hasOwnProperty(name) && !isNaN(name)//name can be numerical
					) {
						thisObj[name] = new _PropertyNodeList();
					}
					else if(typeof thisObj[name] !== "object" || name === "names") {
						// itemprop names must not override builtin properties
						continue;
					}

					if(!~thisObj["names"].indexOf(name)) {
						thisObj["names"].push(name);
					}

					thisObj[name]["_push"](node);
				}
			};

			/**
			 * @param {string} p_name property name
			 * @return {_PropertyNodeList}
			 *TODO:: Check for compliance with FINALE Microdata specification.
			 */
			_HTMLPropertiesCollection.prototype["namedItem"] = function(p_name) {
				return this[p_name] instanceof _PropertyNodeList ? this[p_name] : new _PropertyNodeList();
			};

			/**
			 * @return {string}
			 */
			_HTMLPropertiesCollection.prototype.toString = function() {
				return "[object HTMLPropertiesCollection]";
			};

			/**
			 * @param {number} index of item
			 * @return {Element}
			 */
			_HTMLPropertiesCollection.prototype["item"] = _PropertyNodeList.prototype["item"] = function(_index) {
				var thisObj = this;

				if(isNaN(_index))_index = 0;

				return thisObj[_index] || null;
			};
			// --- === HTMLPropertiesCollection CLASS [END] === ---

			// ------- Extending Element.prototype ---------- //
			// For IE < 8 support use microdata-js.ielt8.js and microdata-js.ielt8.htc

			Object.defineProperties(global["Element"].prototype, {
				"itemValue" : __itemValueProperty,

				"itemProp" : {
					"get" : function() {
						return get__DOMStringCollection_property(this, "itemprop");
					},
					"set" : function(val) {
						return this.setAttribute("itemprop", val + ""), val
					}
				},

				"itemScope" : {
					"get" : function() {
						return this.getAttribute("itemscope") !== null
					},
					"set" : function(val) {
						if( val ) {
							this.setAttribute("itemscope", "");
						}
						else {
							var _;

							if( (_ = this["_"]) && (_ = _["_mcrdt_"]) && (_ = _._properties_CACHE__) ) {
								_._clear();
							}

							this.removeAttribute("itemscope");
						}

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
						return this.setAttribute("itemid", val + ""), val
					}
				},

				"itemType" : __itemTypeProperty,

				"itemRef" : {
					"get" : function() {
						return get__DOMStringCollection_property(this, "itemref");
					},
					"set" : function(val) {
						return this.setAttribute("itemref", val + ""), val
					}
				},

				"properties" : {
					"get" : function() {
						var thisObj = this
							, itemScope = thisObj.itemScope
						;

						if(!thisObj["_"])thisObj["_"] = {};
						var _ = thisObj["_"]["_mcrdt_"] || (thisObj["_"]["_mcrdt_"] = {});

						var properties = _._properties_CACHE__;

						if( properties ) {
							if( !global["microdata_liveProperties"] && itemScope ) {
								return properties;
							}
							else {
								properties._clear();
							}
						}
						else properties = _._properties_CACHE__ = new _HTMLPropertiesCollection();

						if( !itemScope ) {
							return properties;
						}

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

							// TODO:: add test case for <s id=test itemscope itemref=t><s itemscope itemprop=a><s id=t itemscope itemprop=a><s itemprop=a>1</a></a></a></a>
							// test.properties['a'].length === 2
							// If item set by reference -> approve item
							if(candidate["id"] && references.indexOf(candidate["id"]) !== -1)
								return true;

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
									var elementIndex,
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


						props.forEach(properties["_push"], properties);

						return properties;
					}
				}
			});

			//export
			document["getItems"] = __getItems__;
			if( HTMLDocument_prototype ) {
				HTMLDocument_prototype["getItems"] = __getItems__;
			}
			if(!global["PropertyNodeList"])global["PropertyNodeList"] = _PropertyNodeList;
			if(!global["HTMLPropertiesCollection"])global["HTMLPropertiesCollection"] = _HTMLPropertiesCollection;

			//Fixing
			fixPrototypes(global);
		})
		:
		fixPrototypes)(global);

	//cleanup
	tmp = null;

})(window);

