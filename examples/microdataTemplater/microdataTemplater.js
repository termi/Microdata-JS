// @required(microdata)

//closure
;(function(global, ajax) {

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
	thisObj.get = function(params) {
		return _getter ? _getter(_value, params) : _value;
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
global.microdataTemplate = new function() {
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
			isUrl = /(((ht|f)tp(s?)\:\/\/){1}\S+)/.test(_src[0]);
		
		//for tests
		_src[0] = _src[0] + "?" + randomString(3);
		
		if((!isUrl || _src[0] == location.href.split("#")[0]) && _src[1])
			_src[0] = _src[1];
		
		function _element_ready(el, _callback) {
			if(el) {
				element.__templateElement__ = el;
				
				while(_el = el.childNodes[i++])
					element.appendChild(cloneElement(_el));
			
				global.MicrodataJS.fixItemElement(element);
				
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
			templateElement = element.__templateElement__;

		//temp
		if(!templateElement)element.__templateElement__ = _documentFragment.appendChild(cloneElement(element));
			
		attrFrom = tmplOptions["source"] || attrFrom;
		
		if(tmplOptions["target"])
			attrTo = tmplOptions["target"];
		
		if(!isMicrodataItem) {
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
		}
		
		if(!attrTo || !attrFrom)return value;
		
		//Если в шаблоне не указано откуда брать данные - проверяем текстовые ноды
		if(attrTo === "innerHTML" && attrTo == attrFrom) {
			var textNodesValues = [], forseReturn;
			
			//Сначало проверим, а не являются ли текущие текстовые ноды шаблоном
			if(itemprop && itemprop != "")$A(element.childNodes).forEach(function(textChild) {//перебираем текстовые ноды
				if(textChild.nodeType === 3) {
					if(~textChild.nodeValue.indexOf("#" + itemprop + "#")) {
						textChild.nodeValue = textChild.nodeValue.replace("#" + itemprop + "#", value);
						forseReturn = true;
					}
				}
			});
			
			if(forseReturn)return value;
			
			//Шаблоны не нашли - берём сохранённый шаблон
			if(itemprop && itemprop != "" && templateElement)$A(templateElement.childNodes).forEach(function(textChild, i) {//перебираем текстовые ноды
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
					element.__templateElement__ = _documentFragment.appendChild(cloneElement(element));
				}
				
				$A(element.childNodes).forEach(function(textChild) {
					if(textChild.nodeType === 3 && textNodesValues.length) {
						textChild.nodeValue = textNodesValues.shift();
					}
				})
				textNodesValues.forEach(function(new_textChild_value) {
					element.appent(document.createTextNode(new_textChild_value));
				})
			}
		}
		else {
			if(itemprop && ~(element.getAttribute(attrFrom)||"").indexOf("#" + itemprop + "#")) {
				element[attrTo] = element.getAttribute(attrFrom).replace("#" + itemprop + "#", value);
				if(element.getAttribute(attrTo) !== null)element.setAttribute(attrTo, element[attrTo]);
			}
			else element[attrTo] = value;
		}
		
		return value;
	}

/* PUBLICK */
	/** Установим значение одного property
	 * @param {string} */
	thisObj.setProperty = function(element, propertyName, data, forse) {
		var /** @type {Array.<string>} */
			propertyNames,
			/** @type {boolean} */
			isMicrodataItem = element.getAttribute("itemscope") !== null || element.getAttribute("itemtype") !== null,
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
			
		tmplOptions = JSON.parse(element.getAttribute("data-tmpl-options")) || {};
		//Если в настройках переназначается propertyName
		if(tmplOptions["itemprop"])propertyName = tmplOptions["itemprop"];
		
		propertyNames = propertyName.split(" ");
		if(propertyName)while(propertyName = propertyNames[j++]) {
			i = isMicrodataItem ? 0 : 1;
			curProp_value = data;
			curProp_value_isArray = false;
			
			//Проверим, не хотим ли мы принудительно привести к массиву
			if(propertyName.substr(-2) === "[]")curProp_value_isArray = true, propertyName = propertyName.substring(0, propertyName.length - 2);
			
			props = propertyName.split(".");
			
			//Variables
			if(props[0] == thisObj.options.variablesPropertyName) {
				props = propertyName.split("?");
				tempStr = props[1];
				propertyName = props[0];
				props = props[0].split(".");
				if(props[1]) {
					curProp_value = _variables[props[1]];
					if(curProp_value)curProp_value = curProp_value.get(curProp_value.parseParams(tempStr));
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
			if(element.getAttribute("itemscope") != null) {
				_setItemValue(element, curProp_value, propertyName, forse);
				//thisObj.setItem(element, data, forse);
			}
			else {
				if(curProp_value_isArray) {
					var first = true, el;
					$A(curProp_value).forEach(function(curVal) {//Принудительно преведём к массиву и пробежимся по нему
						if(first) {
							_setItemValue(element, curVal, propertyName, forse);
							
							first = false;
							return;
						}
						
						el = insertAfter(
							element.parentNode, 
							cloneElement(element),
							element._lastInsertedNode || element);
							
						el.__templateElement__ = element.__templateElement__;
						_setItemValue(el, curVal, propertyName, forse);
					})
				}
				else _setItemValue(element, curProp_value, propertyName, forse);
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
			var first = true, el;
			$A(data).forEach(function(curData) {//Принудительно преведём к массиву и пробежимся по нему
				if(first) {
					itemElement.__templateElement__ = _documentFragment.appendChild(cloneElement(itemElement));
					thisObj.setItem(itemElement, curData, forse);
					
					first = false;
					return;
				}
				el = insertAfter(
					itemElement.parentNode, 
					cloneElement(itemElement.__templateElement__),
					itemElement._lastInsertedNode || itemElement);
					
				el.__templateElement__ = itemElement.__templateElement__;
				thisObj.setItem(el, curData, forse);
			})
			return;
		}

		//Для старых браузеров: пофиксим Microdata-элемент
		itemElement = global.MicrodataJS.fixItemElement(itemElement);
		
		//thisObj.setProperty(itemElement, "", data, forse);
		
		function doit() {
			$A(itemElement.properties.names).forEach(function(name) {
				$A(itemElement.properties[name]).forEach(function(DOMElement) {
					if(DOMElement.getAttribute("itemscope") != null && data[name]) {
						thisObj.setItem(DOMElement, data[name], forse);
					}
					else {
						thisObj.setProperty(DOMElement, name, data[name.split(".")[0]], forse);
					}
				})
			});
		};
		
		if(itemElement.properties)doit();
		else {
			// --- TEMPORARY ---
			//IE < 8 need some time to apply Element.propery.htc behavior
			//TODO:: do better
			setTimeout(doit, 10);
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
		
		thisObj.registerVariable("date", null, function(val, params) {
			var _format = typeof params == "string" ? params : params && params["format"],
				result = new Date();
			
			return _format && result.format ? result.format(_format) : result + "";
		}, function (){return false});
		
		thisObj.init = function(){}
	}
}

})(window, {
	send : function(url, onload, onerror) {
		SendRequest(url, "", onload, onerror);
	}
});



//TEST
/*(function fixPrototypes(global) {
	if(fixPrototypes.fixed)return;

	function $addEventListener(elt, event, listener) {
		if(document.addEventListener)
			elt.addEventListener(event, listener, false);
		else
			elt.attachEvent('on' + event, listener);
	}
	
	if(!global["PropertyNodeList"]) {
		$addEventListener(global, "DOMContentLoaded", fixPrototypes.bind(global, global)),
			$addEventListener(global, "load", fixPrototypes.bind(global, global))
	}
	else {
		PropertyNodeList.prototype.test = "123"
		fixPrototypes.fixed = true;
	}
})(window)*/
