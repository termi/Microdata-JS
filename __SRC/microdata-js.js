/** @license Microdata API polyfill | @version 6.0 | MIT License | github.com/termi */

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
var __GCC__INCLUDE_DOMSTRINGCOLLECTION__ = false;
// [[[|||---=== GCC DEFINES END ===---|||]]]

"use strict";

(function(global) {
	var
		DOMStringCollection_
		/**
		 * Fix Microdata Item Element for browsers with Microdata support
		 * @param {Window} global
		 */
	  , fixPrototypes

	  , _append

	  , RE_DOMSettableTokenList_lastSpaces

	  , RE_DOMSettableTokenList_spaces

	  , DOMStringCollection_init

	  , DOMStringCollection_init_add

	  , _formElements = {'INPUT' : void 0, 'TEXTAREA' : void 0, 'PROGRESS' : void 0, 'METER' : void 0, 'SELECT' : void 0, 'OUTPUT' : void 0}

	  , _multimediaElement = {'AUDIO' : void 0, 'EMBED' : void 0, 'IFRAME' : void 0, 'IMG' : void 0, 'SOURCE' : void 0, 'TRACK' : void 0, 'VIDEO' : void 0}

	  , _linkElement = {"A" : void 0, "AREA" : void 0, "LINK" : void 0}

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
				_currentValue = _[attributeName] = new DOMStringCollection_(function() {
					return thisObj.getAttribute(attributeName);
				}, function() {
					thisObj.setAttribute(attributeName, this + "");
				}, thisObj);
			}
			else if(value !== null && _currentValue + "" !== value) {
				try {
					//tuche DOMStringCollection to forse update
					_currentValue.add("");
				}
				catch(_e_) {

				}
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
			return this.querySelectorAll(itemTypes ? itemTypes.trim().split(/\s+/).map(function(_itemType) {
				return "[itemscope][itemtype~='" + _itemType + "']"
			}).join(",") : "")
		}

	  , fixPrototypes_isfixed

	  , fixPrototypes_fixedDocumentFragment

	  , HTMLDocument_prototype = (HTMLDocument || {}).prototype || {}

	  , hasNative_getItems = "getItems" in document
	;

	if(__GCC__INCLUDE_DOMSTRINGCOLLECTION__) {
		_append = function(obj, ravArgs) {
			for(var i = 1; i < arguments.length; i++) {
				var extension = arguments[i];
				for(var key in extension)
					if(Object.prototype.hasOwnProperty.call(extension, key) &&
						(!Object.prototype.hasOwnProperty.call(obj, key))
						)obj[key] = extension[key];
			}

			return obj;
		};

		/** @type {RegExp} @const */
		RE_DOMSettableTokenList_lastSpaces = /\s+$/g;
		/** @type {RegExp} @const */
		RE_DOMSettableTokenList_spaces = /\s+/g;

		/**
		 * @param {DOMStringCollection_} _DOMStringCollection
		 * @param {string} _string
		 */
		DOMStringCollection_init = function(_DOMStringCollection, _string) {
			var string = _string || "",//default value
				isChange = !!_DOMStringCollection.length;

			if(isChange) {
				while(_DOMStringCollection.length > 0)
					delete _DOMStringCollection[--_DOMStringCollection.length];

				_DOMStringCollection.value = "";
			}

			if(string) {
				if(string = string.trim()) {
					string.split(RE_DOMSettableTokenList_spaces).forEach(DOMStringCollection_init_add, _DOMStringCollection);
				}
				_DOMStringCollection.value = _string;//empty value should stringify to contain the attribute's whitespace
			}

			if(isChange && _DOMStringCollection._setter)_DOMStringCollection._setter.call(_DOMStringCollection._object_this, _DOMStringCollection.value);
		};

		/**
		 * @param {string} token
		 * @this {DOMStringCollection_}
		 */
		DOMStringCollection_init_add = function(token) {
			this[this.length++] = token;
		}
		;
		/**
		 * __Non-standart__
		 * Utils.Dom.DOMStringCollection
		 * DOMSettableTokenList like object
		 * http://www.w3.org/TR/html5/common-dom-interfaces.html#domsettabletokenlist-0
		 * @param {Function} getter callback for onchange event
		 * @param {Function} setter callback for onchange event
		 * @param {Object} object_this context of onchange function
		 * @constructor
		 */
		DOMStringCollection_ = function(getter, setter, object_this) {
			/**
			 * Event fired when any change apply to the object
			 */
			this._getter = getter;
			this._setter = setter;
			this._object_this = object_this;
			this.length = 0;
			this.value = "";

			this.DOMStringCollection_check_currentValue_and_Token("1");//"1" - fakse token, need only thisObj.value check
		};

		_append(DOMStringCollection_.prototype, {
			DOMStringCollection_check_currentValue_and_Token : function(token) {
				var string = this._getter.call(this._object_this);
				if(string != this.value)DOMStringCollection_init(this, string);

				if(token === "")_throwDOMException("SYNTAX_ERR");
				if(~(token + "").indexOf(" "))_throwDOMException("INVALID_CHARACTER_ERR");
			},
			"add": function(token) {
				var thisObj = this, v = thisObj.value;

				if(thisObj.contains(token)//DOMStringCollection_check_currentValue_and_Token(token) here
					)return;

				thisObj.value += ((v && !v.match(RE_DOMSettableTokenList_lastSpaces) ? " " : "") + token);

				this[this.length++] = token;

				if(thisObj._setter)thisObj._setter.call(thisObj._object_this, thisObj.value);
			},
			"remove": function(token) {
				this.DOMStringCollection_check_currentValue_and_Token(token);

				var i, itemsArray, thisObj = this;

				thisObj.value = thisObj.value.replace(new RegExp("((?:\ +|^)" + token + "(?:\ +|$))", "g"), function(find, p1, offset, string) {
					return offset && find.length + offset < string.length ? " " : "";
				});

				itemsArray = _String_split.call(thisObj.value, " ");

				for(i = thisObj.length - 1 ; i > 0  ; --i) {
					if(!(thisObj[i] = itemsArray[i])) {
						thisObj.length--;
						delete thisObj[i];
					}
				}

				if(thisObj._setter)thisObj._setter.call(thisObj._object_this, thisObj.value)
			},
			"contains": function(token) {
				this.DOMStringCollection_check_currentValue_and_Token(token);

				return !!~(" " + this.value + " ").indexOf(" " + token + " ");
			},
			"item": function(index) {
				this.DOMStringCollection_check_currentValue_and_Token("1");//"1" - fakse token, need only thisObj.value check

				return this[index] || null;
			},
			"toggle": function(token) {
				var result = thisObj.contains(token); //DOMStringCollection_checkToken(token) here;

				this[result ? 'add' : 'remove'](token);

				return result;
			}
		});

		DOMStringCollection_.prototype.toString = function() {//_append function do not overwrite Object.prototype.toString
			return this.value || ""
		};
	}
	else {
		//import
		DOMStringCollection_ = global["DOMStringCollection"];
	}

	if(__GCC__INCLUDE_EXTRAS__) {
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
					if(!(_a = _PropertyNodeList.prototype).toJSON)_a.toJSON =
						/**
						 * @this {PropertyNodeList}
						 * @return {Object} json
						 */
							function() {
							return this.getValues().map(function(cur) {
								if(cur instanceof Element) {
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
				/** @type {Array} "values" property http://www.w3.org/TR/html5/microdata.html#using-the-microdata-dom-api */
				thisObj["values"] = [];
			};
			/**
			 * Non-standart (not in native _PropertyNodeList class) method
			 * @param {Element} newNode DOM-element to add
			 */
			_PropertyNodeList.prototype["_push"] = function(newNode, prop_value) {
				var thisObj = this;

				thisObj[thisObj["length"]++] = newNode;
				thisObj["values"].push(prop_value)
			};
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
				thisObj["names"] = [];
			};

			/**
			 * Non-standart (not in native HTMLPropertiesCollection class) method
			 * @param {Element} node DOM-element to add
			 */
			_HTMLPropertiesCollection.prototype["_push"] = function(node) {
				var thisObj = this,
					prop_value = node["itemValue"],
					prop_name = node["itemProp"],
					name,
					k = -1;

				if(!prop_name)return;

				thisObj[thisObj["length"]++] = node;

				/*if(!~thisObj["names"].indexOf(name)) {
				 thisObj["names"].push(name);
				 };*/


				while(name = prop_name[++k]) {
					if(!~thisObj["names"].indexOf(name)) {
						thisObj["names"].push(name);
					}

					(
						thisObj[name] || (thisObj[name] = new _PropertyNodeList())
						)["_push"](node, prop_value);
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
						val ? this.setAttribute("itemscope", "") : this.removeAttribute("itemscope");

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
						var thisObj = this;

						if(!thisObj["_"])thisObj["_"] = {};
						var _ = thisObj["_"]["_mcrdt_"] || (thisObj["_"]["_mcrdt_"] = {});

						var properties = _._properties_CACHE__;

						if(properties) {
							if(!global["microdata_liveProperties"])return properties;
							else properties._clear();
						}
						else properties = _._properties_CACHE__ = new _HTMLPropertiesCollection();

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


						props.forEach(properties["_push"].bind(properties));

						return properties;
					}
				}
			});

			//export
			HTMLDocument_prototype["getItems"] = document["getItems"] = __getItems__;
			if(!global["PropertyNodeList"])global["PropertyNodeList"] = _PropertyNodeList;
			if(!global["HTMLPropertiesCollection"])global["HTMLPropertiesCollection"] = _HTMLPropertiesCollection;

			//Fixing
			fixPrototypes(global);
		})
		:
		fixPrototypes)(global)

})(window);

