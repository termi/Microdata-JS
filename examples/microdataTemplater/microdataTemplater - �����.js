// @required(microdata)
global = window;//TODO

/** Темплейтер на основе HTML5 Microdata API
 * @param {Node} microdataItem Корневой DOM-элемент - Microdata Item
 * @param {Object|Array.<Object>} data Данные для вставки в microdataItem */
function microdataItem_to_template(microdataItem, data) {
	/**
	 * Set the itemValue of an Element.
	 * http://www.w3.org/TR/html5/microdata.html#values
	 *
	 * @param {Node} element The element to extract the itemValue for.
	 * @param {string} value The itemValue of the element.
	 * @param {string} itemprop Value of itemprop attribute
	 */
	function setItemValue(element, value, itemprop) {
		var elementName = element.nodeName,
			attrTo = "innerHTML",
			attrFrom = attrTo,
			tmplOptions = JSON.parse(element.getAttribute("data-tmpl-options")) || {};

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
			var forseReturn = false;
			if(itemprop && itemprop != "")$A(element.childNodes).forEach(function(textChild) {//перебираем текстовые ноды
				if(textChild.nodeType === 3) {
					if(~textChild.nodeValue.indexOf("#" + itemprop + "#")) {
						textChild.nodeValue = textChild.nodeValue.replace("#" + itemprop + "#", value);
						forseReturn = true;
					}
				}
			});
			
			//Если не нашли ни одной текстовой ноды с "#itemprop#" - действуем стандартно
			if(!forseReturn)element[attrTo] = value;
		}
		else {
			if(itemprop && ~element.getAttribute(attrFrom).indexOf("#" + itemprop + "#"))
				element[attrTo] = element.getAttribute(attrFrom).replace("#" + itemprop + "#", value);
			else element[attrTo] = value;
		}
	}
	
	/** Обработать одно property
	 *@param {string} */
	function processOneProp(itemprop) {
		var /** @type {List.<string>}*/
			props = itemprop.split("."),
			/** @type {Node} Временный элемент*/
			tmplNode,
			/** @type {Node} Текущий выбранный элемент*/
			currentNode,
			/** @type {Object} Настройки шаблона */
			tmplOptions;
		
		$A(microdataItem.properties[itemprop] || []).forEach(function(currentNode) {	
			var /** @type {number} */
				i = 0,
				/** @type {string} */
				curProp_value = data,
				/** @type {Boolean} Значение свойства - массив? */
				curProp_value_isArray = false;
				
			tmplOptions = JSON.parse(currentNode.getAttribute("data-tmpl-options")) || {};
			//Если в настройках переназначается itemprop
			if(tmplOptions["itemprop"])itemprop = tmplOptions["itemprop"];
			//Проверим, не хотим ли мы принудительно привести к массиву
			if(itemprop.substr(-2) === "[]")curProp_value_isArray = true, itemprop = itemprop.substring(0, itemprop.length - 2);
			
			props = itemprop.split(".");
			
			while((curProp = props[i++]) && curProp_value) {
				curProp_value = curProp_value[curProp];
			}
			//Проверим еще раз свойство на массив
			//Если значение свойства - не массив, а в шаблоне указано, что массив - принудительно приводим значение сво-ва к массиву
			curProp_value_isArray = curProp_value_isArray || Array.isArray(curProp_value);
			
			//Проверим, что мы получили последнее свойство в цепочке (prop1.prop2.prop3... etc)
			if(i != props.length + 1)return;
			
			//Текущий элемент - Microdata Item
			if(currentNode.getAttribute("itemscope") != null) {
				// --- TEMP ---
				// DOTO:: Заменить на первоначальное создание из microdataItem клона (cloneNode) в скрытом элементе или DocumentFragment как шаблона и получение этого шаблона для шаблонизации
				/*var ttt = currentNode.getAttribute("itemtype") + randomString(5),
					itemProp = currentNode.getAttribute("itemprop");
				currentNode.setAttribute("itemtype", ttt);
				currentNode.itemType = ttt;
				currentNode.removeAttribute("itemprop");
				currentNode = document.getItems(ttt)[0]
				currentNode.setAttribute("itemprop", itemProp);
				// --- END TEMP ---*/
				
				microdataItem_to_template(currentNode, curProp_value);
			}
			else {
				if(curProp_value_isArray) {
					$A(curProp_value).forEach(function(curVal) {//Принудительно преведём к массиву и пробежимся по нему
						currentNode._lastInsertedNode = 
							insertAfter(
								currentNode.parentNode, 
								cloneElement(currentNode),
								currentNode._lastInsertedNode || currentNode);
						setItemValue(currentNode._lastInsertedNode, curVal, itemprop);
					})
				}
				else setItemValue(currentNode, curProp_value, itemprop);
			}
		})
	}

	if(Array.isArray(data) || (microdataItem.getAttribute("itemprop") || "").substr(-2) === "[]") {
		$A(data).forEach(function(curData) {//Принудительно преведём к массиву и пробежимся по нему
			microdataItem._lastInsertedNode = 
				insertAfter(
					microdataItem.parentNode, 
					cloneElement(microdataItem),
					microdataItem._lastInsertedNode || microdataItem);
			microdataItem_to_template(microdataItem._lastInsertedNode, curData);
		})
	}
	else {
		//Для старых браузеров: пофиксим Microdata-элемент
		microdataItem = global.MicrodataJS.fixItemElement(microdataItem);
		
		$A(microdataItem.properties.names).forEach(processOneProp);
	}
}

//TEST
(function fixPrototypes(global) {
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
})(window)
