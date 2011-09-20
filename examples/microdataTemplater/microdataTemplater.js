// @required(microdata)

//closure
;(function(global, MicrodataJSLib) {

/** Темплейтер на основе HTML5 Microdata API
 * @param {Node} microdataItem Корневой DOM-элемент - Microdata Item
 * @param {Object|Array.<Object>} data Данные для вставки в microdataItem */
global.microdataTemplate = new function() {
	var thisObj = this;
	
/* PRIVATE */
	var _documentFragment = document.createDocumentFragment();

/* OPTIONS */
	thisObj.options = thisObj.options || {};
	
/* PRIVATE | FUNCTIONS */
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
	function setItemValue(element, value, itemprop, forse) {
		var elementName = element.nodeName,
			attrTo = "innerHTML",
			attrFrom = attrTo,
			tmplOptions = JSON.parse(element.getAttribute("data-tmpl-options")) || {},
			templateElement = element.__templateElement__;

		//temp
		if(!templateElement)element.__templateElement__ = _documentFragment.appendChild(cloneElement(element));
			
		attrFrom = tmplOptions["source"] || attrFrom;
		
		if(tmplOptions.target)
			attrTo = tmplOptions.target;
		else if(elementName === 'META')
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
			if(itemprop && ~(element.getAttribute(attrFrom)||"").indexOf("#" + itemprop + "#"))
				element[attrTo] = element.getAttribute(attrFrom).replace("#" + itemprop + "#", value);
			else element[attrTo] = value;
		}
		
		return value;
	}

/* PUBLICK */
	
	/** Установим значение одного property
	 * @param {string} */
	thisObj.setProperty = function(element, propertyName, data, forse) {
		var /** @type {List.<string>}*/
			props = propertyName.split("."),
			/** @type {number} */
			i = 1,
			/** @type {Object} Настройки шаблона */
			tmplOptions,
			/** @type {string} */
			curProp_value = data,
			/** @type {Boolean} Значение свойства - массив? */
			curProp_value_isArray = false;
			
		tmplOptions = JSON.parse(element.getAttribute("data-tmpl-options")) || {};
		//Если в настройках переназначается propertyName
		if(tmplOptions["itemprop"])propertyName = tmplOptions["itemprop"];
		//Проверим, не хотим ли мы принудительно привести к массиву
		if(propertyName.substr(-2) === "[]")curProp_value_isArray = true, propertyName = propertyName.substring(0, propertyName.length - 2);
		
		props = propertyName.split(".");
		
		while((curProp = props[i++]) && curProp_value) {
			curProp_value = curProp_value[curProp];
		}
		//Проверим еще раз свойство на массив
		//Если значение свойства - не массив, а в шаблоне указано, что массив - принудительно приводим значение сво-ва к массиву
		curProp_value_isArray = curProp_value_isArray || Array.isArray(curProp_value);
		
		//Проверим, что мы получили последнее свойство в цепочке (prop1.prop2.prop3... etc)
		if(curProp_value === void 0 || curProp_value === null || i != props.length + 1)return;
		
		//Текущий элемент - Microdata Item
		if(element.getAttribute("itemscope") != null) {
			thisObj.setItem(element, data, forse);
		}
		else {
			if(curProp_value_isArray) {
				var first = true, el;
				$A(curProp_value).forEach(function(curVal) {//Принудительно преведём к массиву и пробежимся по нему
					if(first) {
						setItemValue(element, curVal, propertyName, forse);
						
						first = false;
						return;
					}
					
					el = insertAfter(
						element.parentNode, 
						cloneElement(element),
						element._lastInsertedNode || element);
						
					el.__templateElement__ = element.__templateElement__;
					setItemValue(el, curVal, propertyName, forse);
				})
			}
			else setItemValue(element, curProp_value, propertyName, forse);
		}
	}
	
	thisObj.setItem = function(itemElement, data, forse) {
		
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
			
		$A(itemElement.properties.names).forEach(function(name) {
			$A(itemElement.properties[name]).forEach(function(DOMElement) {
				if(DOMElement.getAttribute("itemscope") != null && data[name]) {
					thisObj.setItem(DOMElement, data[name], forse);
				}
				else {
					thisObj.setProperty(DOMElement, name, data[name.split(".")[0]], forse);
				}
			})
		})
	}
	
	thisObj.set = function(item_or_property) {
	
	}
	
/* INIT */
	thisObj.init = function() {
		
	}
}

})(window, MicrodataJS);



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
