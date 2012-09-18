// @required(microdata)
// @required browser.msie
// @required Array["from"]
// @required HTMLElement.prototype["insertAfter"]

//closure
;(function(global, ajax) {

//aliases
var $ = Function.prototype.bind.call(document.getElementById, document);
var $$ = Function.prototype.bind.call(document.querySelectorAll, document);
var $$0 = Function.prototype.bind.call(document.querySelector, document);

// ----------- =========== IE < 8 ONLY =========== -----------

if(window.Node.prototype["ielt8"]) {//IE < 8 polifill
	var ielt8_style_prev_for_behaviour = $('ielt8_style_prev_for_behaviour'),//ielt8_style_prev_for_behaviour FROM microdata-js.ielt8.js
		behaviours;
		
	if(ielt8_style_prev_for_behaviour && ielt8_style_prev_for_behaviour.tagName == "STYLE" && (behaviours = ielt8_style_prev_for_behaviour.getAttribute("data-url"))) {
		
		var style = document.createElement('style'),
			constent = "x-if,x-else,x-elseif{behavior:"+behaviours+"}";
		style.type = 'text/css';

		if(style.styleSheet) {
			style.styleSheet.cssText = constent;
		} else {
			style.appendChild(d.createTextNode(content));
		}

		document.getElementsByTagName('head')[0].appendChild(style);
	}
	else {
		throw new Error("No scecific DOM-SHIM lib for IE < 8");
	}
};
// ----------- =========== IE < 8 ONLY END =========== -----------

var DEBUG = !!global.DEBUG;

/** 
 * Функция "включает" в IE < 9 элементы шаблонизатора
 */
function template_document(doc) { // pass in a document as an argument
	// create an array of elements IE does not support
	var elements_array = 'x-if x-elseif x-else'.split(' '),
	a = -1;

	if(doc.createElement) {
		while (++a < elements_array.length) { // loop through array
			doc.createElement(elements_array[a]);
		}
	}

	return doc;
} // critique: array could exist outside the function for improved performance?
if(browser.msie && browser.msie < 9)template_document(document);

//Исправляем для IE<9 создание DocumentFragment, для того, чтобы функция работала с элементами шаблонизатора
if(browser.msie && browser.msie < 9) {
	var msie_CreateDocumentFragment = function() {
		var df = msie_CreateDocumentFragment.orig.call(this);
		return template_document(df);
	}
	msie_CreateDocumentFragment.orig = document.createDocumentFragment;
	
	document.createDocumentFragment = msie_CreateDocumentFragment;
}


/**
 * @constructor
 */
function Variable(_name, _value, _getter, _setter) {
	var thisObj = this;
	
	/**
	 * @param {string}
	 * @param {Object|string} One string param or params like ?param1=123&param2=321 in Object {param1:123,param2:321}
	 */
	thisObj.set = function(newVal, params) {
		newVal = _setter ? _setter(newVal, params) : newVal;
		if(newVal !== false)_value = newVal;
		return _value;
	}
	thisObj.get = function() {
		return _getter ? _getter.apply(thisObj, [_value].concat(Array["from"](arguments))) : _value;
	}
}
/**
 * @param {string}
 * @return {Object|string}
 */
Variable.prototype.parseParams = function(paramStr) {
	if(!paramStr)return;

	var result = {},
		paramStr = paramStr.split("&"),
		i = 0,
		p;
		
	while(p = paramStr[i++]) {
		p = p.split("=");
		
		result[p[0]] = p[1] || p[0];
	}
	
	return result;
}

/** Темплейтер на основе HTML5 Microdata API
 * @param {Node} microdataItem Корневой DOM-элемент - Microdata Item
 * @param {Object|Array.<Object>} data Данные для вставки в microdataItem */
global.microdataTemplate = new 
/** @constructor */
function() {
	var thisObj = this;
	
/* PRIVATE */
	var _documentFragment,
		/** @type {Object} Ассоциативный массив Variable */
		_variables = {};

/* OPTIONS */
	thisObj.options = thisObj.options || {};
	/*thisObj.options.useVariable = true;*/
	thisObj.options.variablesPropertyName = "GLOBAL";
	
/* PRIVATE | FUNCTIONS */
	function _isEmptyElement(element) {
		var isEmpty = !element.firstChild, i = 0;
		
		if(!isEmpty) {
			isEmpty = true;
			
			while((el = element.childNodes[i++]) && isEmpty)
				isEmpty = el.nodeType === 3 && el.nodeValue.trim() === "";
		}
		
		return isEmpty;
	}

	function _loadElementTeamplate(element, fullSrc, onLoad_callback) {
		if(!fullSrc)return false;
		
		var el, _src = fullSrc.split("#"), _el, i = 0,
			//isUrl = /(((ht|f)tp(s?)\:\/\/){1}\S+)/.test(_src[0]);
			isUrl = /\w+:(\/\/)?[\w][\w.\/]*/.test(_src[0]);
		
		//for tests
		_src[0] = _src[0] + "?" + randomString(3);
		
		if((!isUrl || _src[0] == location.href.split("#")[0]) && _src[1])
			_src[0] = _src[1];
		
		function _element_ready(el, _callback) {
			if(el) {
				element["__templateElement__"] = el;
				
				while(_el = el.childNodes[i++])
					element.appendChild(_el.cloneNode(true));
							
				_callback();
			}
		}
		
		//Load element teamplate from remote url
		if(isUrl) {
			var fn, cch;
			
			if(cch = _documentFragment._URL_CACHE[fullSrc])
				_element_ready(cch, onLoad_callback);
			
			//TODO::load element
			
			ajax.send(_src[0], fn = function(xhr) {
				try {
					if(xhr.responseText) {
						var newEl;
						
						if(_documentFragment._URL_CACHE[_src[0]]) {						
							_documentFragment._URL_CACHE[fullSrc] = _src[1] ? _documentFragment.querySelector("#" + _src[1]) : newEl;
						}
						else {
							newEl = document.createElement("div");
							
							_documentFragment.appendChild(newEl);
							newEl.innerHTML = xhr.responseText;
							
							_documentFragment._URL_CACHE[fullSrc] = _src[1] ? _documentFragment.querySelector("#" + _src[1]) : newEl;
						}
						
						_element_ready(_documentFragment._URL_CACHE[fullSrc], onLoad_callback);
					}
					else {
						//TODO:: error load teamplate
					}
				}
				catch(e) {
				
				}
			}, fn);
		}		
		else if(_src[0]) {//local element
			_element_ready(document.getElementById(_src[0]), onLoad_callback);
		}
		
		return true;
	}
	
	/**
	 * Set the itemValue of an Element.
	 * http://www.w3.org/TR/html5/microdata.html#values
	 *
	 * @param {Node} element The element to extract the itemValue for.
	 * @param {string} value The itemValue of the element.
	 * @param {string} itemprop Value of itemprop attribute
	 * @param {boolean!} forse Forse reset text nodes
	 * @return {string} value
	 */
	function _setItemValue(element, value, itemprop, forse) {
		var elementName = element.nodeName,
			isMicrodataItem = element.getAttribute("itemscope") !== null || element.getAttribute("itemtype") !== null,
			attrTo = isMicrodataItem ? "" : "innerHTML",
			attrFrom = attrTo,
			tmplOptions = JSON.parse(element.getAttribute("data-tmpl-options")) || {},
			templateElement = element["__templateElement__"];

		//temp
		if(!templateElement)element["__templateElement__"] = _documentFragment.appendChild(element.cloneNode(true));
			
		attrFrom = tmplOptions["source"] || attrFrom;
		
		if(tmplOptions["target"])
			attrTo = tmplOptions["target"];
		
		if(!isMicrodataItem) {
			
			(~['INPUT', 'TEXTAREA', 'PROGRESS', 'METER', 'SELECT', 'OUTPUT'].indexOf(elementName)) ? attrTo = "value" ://Non-standart !!!
			
			elementName === 'META' ? attrTo = "content" :
			~['AUDIO', 'EMBED', 'IFRAME', 'IMG', 'SOURCE', 'TRACK', 'VIDEO'].indexOf(elementName) ? attrTo = "src" :
			~['A', 'AREA', 'LINK'].indexOf(elementName) ? attrTo = "href" :
			elementName === 'OBJECT' ? attrTo = "data" :
			elementName === 'TIME' && element.getAttribute('datetime') ? attrTo = "dateTime" ://TODO:: Check element.dateTime in IE[7,6]
				attrTo = "innerHTML";
		}
		
		if(!attrTo || !attrFrom)return value;
		
		//Если в шаблоне не указано откуда брать данные - проверяем текстовые ноды
		if(attrTo === "innerHTML" && attrTo == attrFrom) {
			var textNodesValues = [], forseReturn;
			
			//Сначало проверим, а не являются ли текущие текстовые ноды шаблоном
			if(itemprop && itemprop != "")Array["from"](element.childNodes).forEach(function(textChild) {//перебираем текстовые ноды
				if(textChild.nodeType === 3) {
					if(~textChild.nodeValue.indexOf("#" + itemprop + "#")) {
						textChild.nodeValue = textChild.nodeValue.replace("#" + itemprop + "#", value);
						forseReturn = true;
					}
				}
			});
			
			if(forseReturn)return value;
			
			//Шаблоны не нашли - берём сохранённый шаблон
			if(itemprop && itemprop != "" && templateElement)Array["from"](templateElement.childNodes).forEach(function(textChild, i) {//перебираем текстовые ноды
				if(textChild.nodeType === 3) {
					if(~textChild.nodeValue.indexOf("#" + itemprop + "#")) {
						textNodesValues.push(textChild.nodeValue.replace("#" + itemprop + "#", value));
					}
					else if(forse) {
						textNodesValues.push(textChild.nodeValue);
					}
				}
			});
			
			//Если не нашли ни одной текстовой ноды с "#itemprop#" - действуем стандартно
			if(!textNodesValues.length)element[attrTo] = value;
			else {
				//Если мы в первый раз шаблонизируем элемент - сохраним первоначальный шаблон
				if(!templateElement) {
					element["__templateElement__"] = _documentFragment.appendChild(element.cloneNode(true));
				}
				
				Array["from"](element.childNodes).forEach(function(textChild) {
					if(textChild.nodeType === 3 && textNodesValues.length) {
						textChild.nodeValue = textNodesValues.shift();
					}
				})
				textNodesValues.forEach(function(new_textChild_value) {
					element.appendChild(document.createTextNode(new_textChild_value));
				})
			}
		}
		else {
			if(itemprop && ~(element.getAttribute(attrFrom) || "").indexOf("#" + itemprop + "#")) {
				element[attrTo] = element.getAttribute(attrFrom).replace("#" + itemprop + "#", value);
				if(element.getAttribute(attrTo) !== null)element.setAttribute(attrTo, element[attrTo]);
			}
			else element[attrTo] = value;
		}
		
		return value;
	}

/* PUBLICK */
	/** Установим значение одного property
	 * @param {Node} _element DOM-элемент - Microdata item
	 * @param {string} propertyName  */
	thisObj.setProperty = function(_element, propertyName, data, forse) {
		var /** @type {Array.<string>} */
			propertyNames,
			/** @type {boolean} */
			isMicrodataItem = _element.getAttribute("itemscope") !== null || _element.getAttribute("itemtype") !== null,
			/** @type {Array.<string>} */
			props,
			/** @type {number} */
			i = isMicrodataItem ? 0 : 1,
			/** @type {number} */
			j = 0,
			/** @type {Object} Настройки шаблона */
			tmplOptions,
			/** @type {Object|string} */
			curProp_value = data,
			/** @type {Boolean} Значение свойства - массив? */
			curProp_value_isArray = false,
			/** @type {string} */
			tempStr;
			
		tmplOptions = JSON.parse(_element.getAttribute("data-tmpl-options")) || {};
		//Если в настройках переназначается propertyName
		if(tmplOptions["itemprop"])propertyName = tmplOptions["itemprop"];
		
		propertyNames = propertyName.split(" ");
		if(propertyName)while(propertyName = propertyNames[j++]) {
			i = isMicrodataItem ? 0 : 1;
			curProp_value = data;
			curProp_value_isArray = false;
			
			//Проверим, не хотим ли мы принудительно привести к массиву
			if(propertyName.substr(-2) === "[]") {
				curProp_value_isArray = true;
				propertyName = propertyName.substring(0, propertyName.length - 2);
				if((tempStr = _element.getAttribute("itemprop") || "").substr(-2) === "[]")_element.setAttribute("itemprop", tempStr.substr(0, tempStr.length - 2));
			}
			
			props = propertyName.split(".");
			
			//Variables
			if(props[0] == thisObj.options.variablesPropertyName) {
				props = propertyName.split("?");
				tempStr = props[1];
				propertyName = props[0];
				props = props[0].split(".");
				if(props[1]) {
					curProp_value = _variables[props[1]];
					if(curProp_value)curProp_value = curProp_value.get(curProp_value.parseParams(tempStr), _element);
					i = props.length + 1;
				}
				else curProp_value = null;
			}
			else while((curProp = props[i++]) && curProp_value) {
				curProp_value = curProp_value[curProp];
			}
			//Проверим еще раз свойство на массив
			//Если значение свойства - не массив, а в шаблоне указано, что массив - принудительно приводим значение сво-ва к массиву
			curProp_value_isArray = curProp_value_isArray || Array.isArray(curProp_value);
			
			//Проверим, что мы получили последнее свойство в цепочке (prop1.prop2.prop3... etc)
			if(curProp_value === void 0 || curProp_value === null || i != props.length + 1)return;
			
			//Текущий элемент - Microdata Item
			if(_element.getAttribute("itemscope") != null) {
				_setItemValue(_element, curProp_value, propertyName, forse);
				//thisObj.setItem(_element, data, forse);
			}
			else {
				if(curProp_value_isArray) {
					var first = true, el;
					Array["from"](curProp_value).forEach(function(curVal) {//Принудительно преведём к массиву и пробежимся по нему
						if(first) {
							_setItemValue(_element, curVal, propertyName, forse);
							
							first = false;
							return;
						}
						
						el = _element.cloneNode(true);
						_element["after"](el);
							
						el["__templateElement__"] = _element["__templateElement__"];
						_setItemValue(el, curVal, propertyName, forse);
					})
				}
				else _setItemValue(_element, curProp_value, propertyName, forse);
			}
		}
	}
	
	thisObj.setItem = function(itemElement, data, forse) {
		var itemid = itemElement.getAttribute("itemid");
		
		if(itemid !== null && _isEmptyElement(itemElement)) {
			var itemid = itemElement.getAttribute("itemid");
			
			if(_loadElementTeamplate(itemElement, itemid, thisObj.setItem.bind(thisObj, itemElement, data, forse)))
			return;
		}
		
		if(Array.isArray(data) || (itemElement.getAttribute("itemprop") || "").substr(-2) === "[]") {
			var first = true, el, _itemprop;
			Array["from"](data).forEach(function(curData) {//Принудительно приведём к массиву и пробежимся по нему
				if(first) {
					itemElement["__templateElement__"] = _documentFragment.appendChild(itemElement.cloneNode(true));
					thisObj.setItem(itemElement, curData, forse);
					
					first = false;
					return;
				}
				el = itemElement["__templateElement__"].cloneNode(true);
				itemElement["after"](el);
					
				el["__templateElement__"] = itemElement["__templateElement__"];
				thisObj.setItem(el, curData, forse);
			})
			
			if((_itemprop = itemElement.getAttribute("itemprop") || "").substr(-2) === "[]")itemElement.setAttribute("itemprop", _itemprop.substr(0, _itemprop.length - 2));
			
			return;
		}
		
		//thisObj.setProperty(itemElement, "", data, forse);

		try {
			if(itemElement["properties"]){
				Array["from"](itemElement["properties"]).forEach(function(DOMElement) {
					Array["from"](DOMElement["itemProp"]).forEach(function(name) {
						try {
							if(DOMElement.getAttribute("itemscope") != null && data[name]) {
								thisObj.setItem(DOMElement, data[name], forse);
							}
							else {
								thisObj.setProperty(DOMElement, name, data[name.split(".")[0]], forse);
							}
						}
						catch(e) {
							//alert("222 ||| namee = " + name + " | " + data[name])
							throw e;
						}
					});
				})
			}
			else {
				if(DEBUG)console.error("The is no 'properties' property in element")
			}
		}
		catch(e) {
			//alert(itemElement.outerHTML)
			throw e;
		}
	}
	
	thisObj.set = function(item_or_property) {
	
	}
	
	thisObj.registerVariable = function(varName, initValue, getter, setter) {
		_variables[varName] = new Variable(varName, initValue, getter, setter);
	}
/* INIT */
	thisObj.init = function() {
		_documentFragment = document.createDocumentFragment();
		_documentFragment._URL_CACHE = [];
		
		thisObj.registerVariable("date", null, function(val, params, DOMElement) {
			var _format,
				_update,
				result = new Date();
		
			if(typeof params == "string")_format = params;
			else if(params) {
				_format = params["format"];
				_update = params["update"];
			}
			
			/* Just proof of contecept
				TODO::
			if(_update && !isNaN(_update) && DOMElement) {
				setInterval(function() {
					DOMElement.itemValue = _format && (result = new Date()).format ? result.format(_format) : result + "";
				}, _update++)
			}*/
			
			return _format && result.format ? result.format(_format) : result + "";
		}, function (){return false});
		
		thisObj.init = function(){}
	}
}

})(window, {// ajax object
	send : function(url, onload, onerror) {
		SendRequest(url, "", onload, onerror);
	}
});



//TEST
/*(function fixPrototypes(global) {
	if(fixPrototypes.fixed)return;

	function Array["from"]ddEventListener(elt, event, listener) {
		if(document.addEventListener)
			elt.addEventListener(event, listener, false);
		else
			elt.attachEvent('on' + event, listener);
	}
	
	if(!global["PropertyNodeList"]) {
		Array["from"]ddEventListener(global, "DOMContentLoaded", fixPrototypes.bind(global, global)),
			Array["from"]ddEventListener(global, "load", fixPrototypes.bind(global, global))
	}
	else {
		PropertyNodeList.prototype.test = "123"
		fixPrototypes.fixed = true;
	}
})(window)*/
