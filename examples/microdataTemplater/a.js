// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @warning_level VERBOSE
// @jscomp_warning missingProperties
// @output_file_name default.js
// @check_types
// ==/ClosureCompiler==
/**
 * module
 * @version 2.6.5
 *  changeLog: 2.6.5 [15.09.2011 02:43] Доюавил эмуляцию document.readyState для браузеров, в которых нету document.readyState
 			   2.6.4 [03.08.2011 02:40] Добавил много TODO в комментарии, заменил browser.msieV на browser.msie
			   2.6.3 [13.07.2011 02:27] Переписал Определение браузера. Добавил определение ipad, ipod, iphone. Изменения в функциях
			   2.6.2 [21.06.2011 16:30] [Bug*]Не объявлялась глобальная переменная global в "strict mode"
			   2.6.1 [25.05.2011 12:57] Добавил новую глобальную переменную global для замены вызова window во всех модулях
			   2.6   [24.05.2011 21:00] Добавил функцию для наследования классов extend и функции Object.keys и Object.create. Переписал методы loader_interface и imageLoader. loader_interface переименовал в loader
			   2.5.2 [18.05.2011 13:00] Убрал isCssTransition из Site за ненадобностью.
			   2.5.1 [16.05.2011 17:32] Не использую сокращение w = window (@deprecated), т.к. оно создаёт проблемы при компиляции в GCC. GCC прописывает вместо w, например, букву n, далее он вместо выражения w.someParam, подставляет n.n (тут вторая n идёт просто по очереди в алфавите) при этом (n.n === n) <-- и тут создаётся путаница
 			   2.5   [11.05.2011 12:21] Добавил функцию bubbleEventListener
			   2.4   [07.05.2011 ##:##] Исправил баги $$ и $$N
 **/

/** Переопределяем глобальную переменную для модулей
 * @const */
window.global = window;
//Не var, чтобы GCC при ADVANCED_OPTIMIZATIONS не переименовал переменную.
//Перед "use strict" потому, что в "strict mode" не смогу объявить переменную global в объекте window, да так, чтобы переменная global была видна по-умолчанию

"use strict";

//Создадим алиасы глобальных переменных window и document для уменьшения размера кода
// При этом не стоит забывать, что на некоторых JS-движках (особенно V8) такой код:
// d.<prop> весто document.<prop> будет выполнятся на ~10% медленнее
// пруф: http://habrahabr.ru/blogs/javascript/100828/#comment_3186840
var /** @const @deprecated */w = window;
var /** @const */d = document;
var /** @const */funcType = "function";
var /** @const */undefType = "undefined";


//d.head = d["head"];//Для Closure Compiller'а

/** @define {boolean} */
var IS_DEBUG = true;
/** @const */
var DEBUG = IS_DEBUG && !!window.console;

//Определение браузера.
//Код: https://gist.github.com/989440
//Разъяснение: http://habrahabr.ru/blogs/javascript/115841/
//TODO:: Всесторонне протестировать
/*var browser = (function () {
    var w = this.Worker,
        l = w && (w.prototype + "").length;

    return {
        mozilla: l == 36, // is Firefox?
        opera: l == 33, // is Opera?
        safari: l == 24, // is Safari?
        chrome: l == 15, // is Chrome?
        msie: !w       // is IE?
    }
})()
*/

//Определение браузера и поддерживаемых возможностей
//Если что-то еще понадобится, можно посмотреть тут https://github.com/mrdoob/system.js
/** @type {Object}
 * @const */
var browser = {
/** @type {string}
 * @const */
	agent : navigator.userAgent.toLowerCase()
};
;(function () {
//Тут не хватает chrome
//TODO:: Chrome определяется как Safari
/** @type {Array}
 * @const */
browser.names = browser.agent.match(/(mozilla|compatible|webkit|safari|opera|msie|iphone|ipod|ipad)/gi);
/** @type {number} */
var len = browser.names.length;
while(len-- > 0)browser[browser.names[len]] = true;
//Alians'es
/** @type {boolean}
 * @const */
browser.mozilla = browser["mozilla"];
/** @type {boolean}
 * @const */
browser.webkit = browser["webkit"];
/** @type {boolean}
 * @const */
browser.safari = browser["safari"];
/** @type {boolean}
 * @const */
browser.opera = browser["opera"];
/** @type {boolean}
 * @const */
browser.msie = browser["msie"];
/** @type {boolean}
 * @const */
browser.iphone = browser["iphone"];
/** @type {boolean}
 * @const */
browser.ipod = browser["ipod"];
/** @type {boolean}
 * @const */
browser.ipad = browser["ipad"];

/** @deprecated Теперь версию IE записываю непосредственно в browser.msie */
browser.msieV == void 0;

if(browser["compatible"] || browser.webkit) {
	browser.mozilla = false;
	delete browser["mozilla"];
}
else if(browser.opera) {
	browser.msie = false;
	delete browser["msie"];
}
if(browser.msie)for(var i = 6 ; i < 10 ; i++ )//IE from 6 to 9
    if(new RegExp('msie ' + i).test(browser.agent)) {
		browser.msie = i;
		
		browser.msieV = browser.msie;//Оставляю пока для совместимости
		
		break;
	}
//Определяем поддерживаемые браузером технолигии
/** @type {Node}
 * @const */
browser.testElement = document.createElement('div');
/** @type {boolean}
 * @const */
browser.traversal = typeof browser.testElement.childElementCount != 'undefined';
browser.isPlaceholder = typeof document.createElement("INPUT").placeholder != undefType;
})();


if(!document.readyState)browser.noDocumentReadyState = true;
if(browser.noDocumentReadyState)document.readyState = "uninitialized";


/*  =======================================================================================  */
/*  =================================  Object prototype  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

/**
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
 * Returns an array of all own enumerable properties found upon a given object, in the same order as that provided by a for-in loop (the difference being that a for-in loop enumerates properties in the prototype chain as well).
 * @param obj The object whose enumerable own properties are to be returned.
 */
if(!Object.keys)Object.keys = function(obj) {
 /* Нахрен проверки, в Мозиле сидят какие-то перестраховщики
 if(obj !== Object(obj))
      throw new TypeError('Object.keys called on non-object');*/
	var ret = [], p;
	for(p in obj)if(Object.prototype.hasOwnProperty.call(obj, p))ret.push(p);
	return ret;
}

if(!Object.getOwnPropertyNames)Object.getOwnPropertyNames = function(obj) {
 	var ret = [], p;
	for(p in obj)ret.push(p);
	return ret;
}

/**
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
 * JavaScript 1.8.5
 * Creates a new object with the specified prototype object and properties.
 * @param proto The object which should be the prototype of the newly-created object.
 * //NOT SUPPORTED OPERA < 12 AND IE < 9//:: /@/param propertiesObject If specified and not undefined, an object whose enumerable own properties (that is, those properties defined upon itself and not enumerable properties along its prototype chain) specify property descriptors to be added to the newly-created object, with the corresponding property names.
 */
if(!Object.create)Object.create = function(proto/*, propertiesObject*/) {
	/** @constructor */ 
	function F() {}
	F.prototype = proto;
	return new F();
};


Object.append = function(object) {
	for(var i = 1; i < arguments.length; i++) {
		var extension = arguments[i];
		for(var key in extension)
			if(!extension.hasOwnProperty || extension.hasOwnProperty(key))object[key] = extension[key];
	}
	
	return object;
}

/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Object prototype  ==================================  */
/*  =======================================================================================  */

/*  =======================================================================================  */
/*  ======================================  Classes  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

/**
 * Наследует класс Child от Parent - фактически, только добавляет prototype Parent в цепочку прототипов Child. Не выполняет инициализирующий код содержащийся в конструкторе Parent, поэтому в конструкторе Child нужно дополнительно вызвать Child.superclass.constructor.call(this, ...)
 * @param {Function} Child
 * @param {Function} Parent
 */
function extend(Child, Parent) {
	(Child.prototype = Object.create(Child.superclass = Parent.prototype)).constructor = Child;
}

/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Classes  ======================================  */
/*  =======================================================================================  */


/*  =======================================================================================  */
/*  ======================================  Network  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

/*
 * Получение XHR
 * @return {XMLHttpRequest}
 
var getXmlHttp = XMLHttpRequest ? function(){ return new XMLHttpRequest() } : 
function() {
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = null;
    }
  }
  return xmlhttp;
}*/

/**
 * @param {String} link Path to the script
 * @param {function=} callback Optional callback executed onload
 * TODO:: Заменить на https://github.com/CapMousse/include.js ???
 *		  или заменить на функцию js из http://headjs.com/ ???
 * 		  или на CommonJS like аналог https://github.com/jiem/my-common [предпочтительнее, только нужно переписать некоторые тупые моменты]
 *		  или на http://requirejs.org/ ??? Бля ну и выбор !!!
 */
function addScript(link, callback){
	var newScript = document.createElement('script');
	newScript.src = link;
	newScript.onload = function() {
		!!callback && callback();
	};
	document.body.appendChild(newScript);
}

/**
 * Функция посылки запроса к файлу на сервере
 * TODO:: Переделать на объект-замыкание AJAX и не использовать window для хранения флагов/настроек
 * @param {!string} path путь к файлу
 * @param {string} args аргументы вида a=1&b=2&c=3... или пустая строка ""
 * @param {function(XMLHttpRequest)=} onDone
 * @param {function(XMLHttpRequest)=} onError — функции-обработчик ответа от сервера, если в функцию передаётся null - значит она была прервана по timeout
 * @param {SendRequest.optionsType=} options Дополнительные опции: post - любое true значение означает, что нужно применить POST метод; temporary - любое значение означает, что нужно создать новый XHR объект и удалить его после выполнения запроса; timeOut - время в мс, по истечении которого, выполнения запроса прирывается и вызывается функция onError; onProccess - функция вызываемая во время выполнения запроса
 * @version 2.3
 *  versionLog: 2.3 [23.06.2011 15:10] options.temporary включается, если глобальный XHR занят
 *				2.2 [22.06.2011 13:00] [bug*]Не задавался options по-умолчанию
 *				2.1 [25.05.2011 14:51] Внедрил getXmlHttp внутрь функции
 *				2   [23.05.2011 13:46] Рефакторинг кода: Убрал пораметры method, onProccess и temp в новый параметр options. 
Короткая версия:
function xhr(m,u,c,x) {
	with(new(global.XMLHttpRequest||ActiveXObject)("Microsoft.XMLHTTP"))
		onreadystatechange = function(x){
			readyState ^ 4 || c(x)
		},
		open(m, u),
		send(c)
}
  TODO:: Посмотреть реализацию тут http://code.google.com/p/microajax/
         и тут https://github.com/ded/Reqwest
 */
function SendRequest(path, args, onDone, onError, options) {
	options = options || {};//Default value
	
	function getXmlHttp() {
		return new (global.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");
	}
	
	//TODO:: Прерывать соединение по timeOut, и вызывать funcError и определённым кодом ошибки
	// Получаем объект XMLHTTPRequest
    if(!window.XHR || SendRequest.outOfDate){
    	window.XHR = null;//Удалим старый XHR//Avoid memory leak
		SendRequest.outOfDate = false;
		window.XHR = getXmlHttp();
        window.working = false;
    }
    if(!window.XHRs)w.XHRs = [];
	//Каждые 5 минут поднимаем флаг, что XHR устарел
	setTimeout(function() {SendRequest.outOfDate = true}, 3e5);
	
	var method = options.post ? "POST" : "GET",
		//Создаём отдельный XHR в случае, если глобальный XHR занят или, если в опциях указан temporary
		temp = options.temporary || window.working;
	
	// Запрос
    if ((!window.working && window.XHR) || temp) {
    	var http1 = temp ? window.XHRs[SendRequest.guid] = getXmlHttp() : window.XHR,
    		tmpXHRguid = temp ? SendRequest.guid++ : null;
    	
    	//Проверяем, если требуется сделать GET-запрос
		if(!options.post && args.length > 0)
			path += "?" + args;//добавляем закодированный текст в URL запроса

        //Инициализируем соединение
		http1.open(method, path, true);

        //прикрепляем к запросу функцию-обработчик событий
        http1.onreadystatechange = function() {// 4 - данные готовы для обработки
        	if (http1.readyState == 4) {
            	if(http1.status == 200) {// если статус 200 (ОК) - выдать ответ пользователю
            		if(onDone)onDone(http1);
            	}
            	else if(onError)onError(http1);
            	
                if(!temp)window.working = false;
                else delete window.XHRs[tmpXHRguid];//Удалим временный объект XHR
            }
            else{ // данные в процессе получения, можно повеселить пользователя сообщениями ЖДИТЕ ОТВЕТА
            	if(options.onProccess)options.onProccess();
            }
        }
        if(!temp)window.working = true;
        
        if (options.post) {//Если это POST-запрос
			//Устанавливаем заголовок
			http1.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
			//Посылаем запрос
			http1.send(args);
		}
		else {//Если это GET-запрос
			//Посылаем нуль-запрос
			http1.send(null);
		}
    }
	if(!window.XHR) {
		if(DEBUG)Log.err("Ошибка при создании XMLHTTP объекта!");
		return false;//alert('Ошибка при создании XMLHTTP объекта!')
	}
}
SendRequest.guid = 0;
/** @typedef {({post:boolean, temporary:boolean, timeOut:number, onProccess:Function}|
			   {post:boolean, temporary:boolean, timeOut:number}|
			   {post:boolean, temporary:boolean}|
			   {post:boolean}|
			   {temporary:boolean, post:boolean, onProccess:Function}|
			   {temporary:boolean, onProccess:Function}|
			   {temporary:boolean, timeOut:number}|
			   {temporary:boolean}|
			   {timeOut:number, temporary:boolean, post:boolean}|
			   {timeOut:number, onProccess:Function}|
			   {timeOut:number, post:boolean}|
			   {timeOut:number}|
			   {onProccess:Function, post:boolean, timeOut:number}|
			   {onProccess:Function, post:boolean}|
			   {onProccess:Function})} */
SendRequest.optionsType;

/**
 * Базовый конструктор для загрузки одного или нескольких путей. В базовом функционале, пути загружаются как текстовая информация
 * //TODO:: Доописать
 * @constructor
 * @param {string|Array.<string>} _urls Один или нескоько путей для загрузки
 * @param {Function} _allDone Функция вызывается, когда загрузка всех url завершена, с ошибками или без
 * @param {Function=} _onLoad Callback вызываемый при загрузки одного пути
 * @param {Function=} _onError CAllback вызываемый при возникновении ошибки во время загрузки пути или при прерывании по таймауту. При прерывании по таймауту, в функцию передаётся false первым параметром
 * @param {Object=} options Опции: {DOMElement - DOM-элемент ассоциируемый с загружаемым контентом; timeoutDelay - время в мс, сколько ждём загрузки каждого пути; attemptCount - кол-во попыток для каждого пути, если загрузка пути была прервана по timeOut; TODO::allowAsynh - собирает неудачные загрузки в очередь и загружает следующий путь, после того, как попробует загрузить все пути, возвращяется к неудачным и пробует attemptCount - 1 раз их загрузить; TODO:: parallel - паралельная загрузка нескольких путей сразу}
 * @version 2.1
 */
function loader(_urls, _allDone, _onLoad, _onError, options) {
/* DEFAULT VALUES */
	options = options || {};
	var emptyF = function(){}
	_onLoad = _onLoad || emptyF;
	_onError = _onError || emptyF;

/* PRIVATE */
	var thisObj = this,
		/** @type {string} @private Последнее обработанное URL */
		_currentUrl,
		/** @type {number} */
		_loadCount = 0,
		/** @type {number} Идентификатор для setTimeout */
		_timeoutId,
		/** @type {number} Текущая попытка */
		_timeoutAttempt;
	
/* PRIVATE | FUNCTIONS */
	/** 
	 * Внутренняя функция, которая будет последовательно (в паре с thisObj.done) загружать данные */ 
	function _next() {
		var url = _urls[_loadCount++], i = _loadCount - 1;
		if(thisObj.prepare)url = thisObj.prepare(url, i) || url;
		_currentUrl = url;
		//Вызываем функцию thisObj.load, если функция вернула true, значит данные загрузились сразу.
		if(!thisObj.load(url, i)) {
			_timeoutAttempt = 0;
			//Установим таймаут. Очищяется он, при успешной загрузке в done
			_timeoutId = setTimeout(_timeout.bind(thisObj, url, i), options.timeoutDelay);
			//if(!options.timeoutDelay)thisObj.done(url, i, true);
		}
		else thisObj.done(url, i, true);
	};
	
	/**
	 * 
	 */
	function _XHREvent(url, index, success, XHR) {
		(success ? thisObj.done : thisObj.error)(url, index, success, XHR.responseText);
	}
	
	/** Функция остановки загрузки данных, по таймауту и 
	 *  перезапуска (еще раз вызывается thisObj.load), если есть еще попытки
	 * @param {string} url Url загружаемого объекта
	 * @param {number} index индекс url-строки в массиве _urls
	 */
	function _timeout(url, index) {
		if(++_timeoutAttempt < thisObj.attemptCount)
			thisObj.done(url, index, true);
		else thisObj.error(url, index, false);
	};
	
/* PUBLICK */
	/** @type {HTMLElement|null|undefined} DOM-элемент ассоциируемый с загружаемым контентом */
	thisObj.DOMElement = options.DOMElement;
	
	/** Функция вызываемая при успешной загрузки данных
	 * @param {string} url
	 * @param {number} index
	 * @param {boolean} success
	 * @param {string=} message
	 */
	thisObj.done = function(url, index, success, message) {
		(success ? _onLoad : _onError)(url, index, success, message);
		
		if(thisObj.DOMElement) {
			removeCssClass(thisObj.DOMElement, thisObj.cssClasses.loadingProccess);
			addCssClass(thisObj.DOMElement, success ? thisObj.cssClasses.loadingEnd : thisObj.cssClasses.loadingError);
			//Обнуляем указатель на элемент
			thisObj.DOMElement = null;
		}
		
		//Очистим таймаут
		if(_timeoutId)clearTimeout(_timeoutId);
		
		//Если не все url загружены - продолжим загрузку
		if(_loadCount < _urls.length)_next();
		else {
			if(thisObj.allDone)thisObj.allDone();
			if(_allDone)_allDone();
			//Предотвращяем выполнение функций, когда наш цикл уже завершен. При этом thisObj уже больше не будет работать. На всякий случай, но конечно, нужно придумать более элегантное решение.
			thisObj.error = thisObj.done = emptyF;
		}
	}
	/** Функция вызываемая при ошибки загрузки данных
	 * @param {string} url
	 * @param {number} index
	 * @param {boolean} success
	 * @param {string=} message
	 */
	thisObj.error = thisObj.done;
	
	/** @type {function(string, number): string|null}
	 * param1 - url URL данных, которые будут вызваны непосредственно после выполнения этой функции
	 * param2 - urlIndex индекс url-строки в массиве _urls
	 * Пользовательская функция вызываемая непосредственно перед функцией load.
	 * В ней можно, например, задать объект thisObj.DOMElement
	 * Может вернуть новую строку URL*/
	thisObj.prepare;
	
	/** @type {Function} TODO:: Описать*/
	thisObj.allDone;
	
	/** Функция загрузки данных - реализуется наследником
	 * @param {string} url Url загружаемого объекта
	 * @param {number} index индекс url-строки в массиве _urls
	 * @return {boolean} флаг, загрузились ли данные сразу	 */
	thisObj.load = function(url, index) {
		SendRequest(url, "", _XHREvent.bind(thisObj, url, index, true), _XHREvent.bind(thisObj, url, index, false), {temporary : true});
		//TODO:: Если выполнение запроса прервано по timeOut в функции _timeout - прерывать и фактическое выполение XHR, который создаётся в функции SendRequest
		return false;
	}
	
	thisObj.start = function() {
		//Если не массив - сделаем массив
		if(!Array.isArray(_urls))_urls = [_urls];
		
		//Если есть элемент - добавим к нему класс сигнализирующий, что загрузка началась
		if(thisObj.DOMElement)addCssClass(thisObj.DOMElement, thisObj.cssClasses.loadingProccess);
		
		//Запустим последовательную загрузку
		_next();
	}
}
/** @type {Object} CSS-классы:
 *  loadingProccess - назначается thisObj.DOMElement перед загрузкой данных,
 *   после загрузки снимается
 *  loadingEnd - назначается thisObj.DOMElement после загрузки данных	 */
loader.prototype.cssClasses = {
	loadingProccess : "loading",
	loadingEnd : "loaded",
	loadingError : "loadError"
}

/**
 * TODO:: Описать
 * FOR TESTS: 
var resources = d.getElementById("resources");
var t = new imageLoader(["http://ie.microsoft.com/testdrive/HTML5/DOMContentLoaded/whidbey2.jpg",
						 "http://img7-fotki.yandex.net/get/5007/dyshanov.6/0_STATIC78c6f_a702141f_L",
						 "http://img-fotki.yandex.ru/get/5006/shyrokykh-sergiy.ca/0_52464_6d5ad74c_L"],
						function(){	alert("allDone")},
						function(imgSrc, index, succ, msg){resources.innerHTML += '<img src="' + imgSrc + '">'})
t.start();
 * @version 2.1
 * @constructor
 * @extends {loader}
 */
function imageLoader(url, _allDone, _onLoad, _onError, options) {
/* DEFAULT VALUES */
	options = options || {};
	//Определим время, за которое картинка должна загрузится и кол-во попыток на одну картинку
	options.timeoutDelay = options.timeoutDelay || 5000;//5 секунд ждём загрузки картинки
	options.attemptCount = options.attemptCount || 3;//Делаем три попытки. [Актуально для Opera] - В Опере иногда не срабатывает событие onload - бля, я не знаю почему :(
	
	var thisObj = this;
	imageLoader.superclass.constructor.apply(thisObj, arguments);

/* PRIVATE */	
	var _img = new Image();
	
	thisObj.load = function(url, index) {
		if(!_img.onload)_img.onload = thisObj.done.bind(thisObj, url, index, true, url);
		if(!_img.onerror)_img.onerror = thisObj.error.bind(thisObj, url, index, false, url);
	
		//thisObj._img.src = null;//TODO:: Проверить в Опере, вызывается ли в результате событие onload, если перед второй попыткое не обнулять src 
		_img.src = url;
		
		return _img.complete;
	}
	thisObj.allDone = function() {
		//Очистим объект _img
		//Если события не очистить, то может быть ложное/повторное срабатывание onerror или onload
		//Если thisObj._img.src установить "", то, например, в Chrome это будет расцениватся не как обнуление, а
		// как установка пути в location.href
		_img.onload = _img.onerror = _img.src = null;
	}
}
extend(imageLoader, loader);

/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Network  ======================================  */
/*  =======================================================================================  */


/*  ======================================================================================  */
/*  ======================================  Events  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

/**
	@namespace Класс для работы с событиями
	02.08.11    ver.2.2.1 Добавил экспортируемые функции Events.addEventListener и Events.removeEventListener
	19.01.11	ver.2.2.0.1 (!)Исправил небольшой баг в Opera в fixEvent, связаный с вычислением event.relatedTarget
	15.11.10	ver.2.2.0::Важное: выключил возможность игнорировать событие по guid, т.к. неюзабельно
	30.09.10	ver.2.1.3
	TODO:: Переписать или заменить на [дописаный] https://github.com/arexkun/Vine
		   при переписывании можно использовать наработки https://github.com/kbjr/Events.js
	Event -> Events
*/
var Events = (function() {
	var guid = 0;// текущий номер обработчика

	// кросс-браузерная предобработка объекта-события
    // нормализация свойств и т.п.
    
	var preventDefault_ = function(){this.returnValue = false};
	var stopPropagation_ = function(){this.cancelBubble = true};
		
	function fixEvent(event){
		
		// один объект события может передаваться по цепочке разным обработчикам
  		// при этом кроссбраузерная обработка будет вызвана только 1 раз
  		// Снизу, в функции commonHandle,, мы должны проверять на !event.isFixed
		event.isFixed = true;// пометить событие как обработанное

		// добавить preventDefault/stopPropagation для IE
		event.preventDefault || (event.preventDefault = preventDefault_);
		event.stopPropagation || (event.stopPropagation = stopPropagation_);

		event.target || (event.target = event.srcElement || d);// добавить target для IE

		// добавить relatedTarget в IE, если это нужно
		if(event.relatedTarget === void 0 && event.fromElement)
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;

		// вычислить pageX/pageY для IE
		if(event.pageX == null && event.clientX != null) {
			var html = d.documentElement, body = d.body;
			/*event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
			event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);*/
			//Новая вервия нуждающаяся в проверки
			event.pageX = event.clientX + (window.pageXOffset || html.scrollLeft || body.scrollLeft || 0) - (html.clientLeft || 0);
			event.pageY = event.clientY + (window.pageYOffset || html.scrollTop || body.scrollTop || 0) - (html.clientTop || 0);
		}

		// записать нажатую кнопку мыши в which для IE. 1 == левая; 2 == средняя; 3 == правая
		event.which || event.button && (event.which = event.button & 1 ? 1 : event.button & 2 ? 3 : event.button & 4 ? 2 : 0);
			
		// событие DOMAttrModified
		//  TODO:: недоделано
		// TODO:: Привести event во всех случаях (для всех браузеров) в одинаковый вид с newValue, prevValue, propName и т.д.
		if(!event.attrName && event.propertyName)event.attrName = event.propertyName.split('.')[0];//IE При изменении style.width в propertyName передаст именно style.width, а не style, как нам надо

		return event
	}

	// вспомогательный универсальный обработчик. Вызывается в контексте элемента всегда this = element
	function commonHandle(event) {
		/*---===DEBUG===---*///		console.log(event.type);
		//Проверим тип event'а на нахождение в списке игнорирования
		if(event.type in Events.ignoreFuncGuids) {
			if(Events.ignoreFuncGuids[event.type] > 0 && --Events.ignoreFuncGuids[event.type] == 0)delete Events.ignoreFuncGuids[event.type];
			return;
		}
		
		var handlers = this.events[event.type], errors = [];//Инициализуется массив errors для исключений
		
		if(!(event = event || window.event).isFixed)event = fixEvent(event);// получить объект события и проверить, подготавливали мы его для IE или нет

		for(var g in handlers)if(handlers.hasOwnProperty(g)) {
			var handler = handlers[g];
			
			//Добавляем в список игнорирования события указаные для игнорирования
			if(handler.ignoreGuids)for(var i in handler.ignoreGuids)if(handler.ignoreGuids.hasOwnProperty(i))
				Events.ignoreFuncGuids[handler.ignoreGuids[i]] = -1;

			try {
				if(this.eventsData && this.eventsData[handler.guid])var data = this.eventsData[handler.guid];
				//Передаём контекст, объект event и данные, результат сохраним в event['result'] для передачи значения дальше по цепочке
				if((event['result'] = handler.call(this, event, data)) === false) {//Если вернели false - остановим обработку функций
					event.preventDefault()
					event.stopPropagation()
				}
			}
			catch(e) { 
				errors.push(e);//Все исключения - добавляем в массив, при этом не прерывая цепочку обработчиков.
			}
			
			//Удалим из списка игнорирования
			if(handler.ignoreGuids)for(var i in handler.ignoreGuids)if(handler.ignoreGuids.hasOwnProperty(i))
				delete Events.ignoreFuncGuids[handler.ignoreGuids[i]];

			//Если событие вызвалось определённое кол-во раз - удаляем его
			if(handler.execCount && --handler.execCount <= 0)Events.remove(this, event.type, handler);
			
			if(event.stopNow)break;//Мгновенная остановка обработки событий
		}
		
		if(errors.length == 1) {//Если была только одна ошибка - кидаем ее дальше
			if(DEBUG)Log.err(errors[0])
			//throw errors[0]
		}
		else if(errors.length > 1) {//Иначе делаем общий объект Error со списком ошибок в свойстве errors и кидаем его
			if(DEBUG)errors.forEach(Log.err);
			/*var e = new Error("Multiple errors thrown in handling 'sig', see errors property");
			e.errors = errors;
			throw e;*/
		}  
	}
	
	function cloneFunction(func){
		return eval('_$=' + func.toString());
	}
	
	function $addEventListener(elt, event, listener) {
		if(document.addEventListener)
			elt.addEventListener(event, listener, false);
		else
			elt.attachEvent('on' + event, listener);
	}
	function $removeEventListener(elt, event, listener) {
		if(document.removeEventListener)
			elt.removeEventListener(event, listener, false);
		else 
			elt.detachEvent("on" + event, listener);
	}
	
	return {
		addEventListener : $addEventListener,
		removeEventListener : $removeEventListener,
		
		//Объект, в котором хранятся пары "название события"-"пользовательская функция добавления"
		//"пользовательская функция добавления" должна возвращать guid функции добавленной к событию
		userAdd : {},

		//Объект в котором хранятся ключи обработчиков, которые commonHandle игнорирует
		//Объект типа <ключ>:<значение>, где <ключ> - guid обработчика, <заначение> - кол-во игнорирований.
		// <заначение> декриментируется каждый раз, когда вызывается commonHandle
		// Если после декримента <заначение> == 0, <ключ> удаляется из объекта
		ignoreFuncGuids : {},

		//Синонимы для типов событий. Используются для игнорирования виртуальных событий.
		//Заполняется вместе с userAdd
		typeSinonims : [],

		//добавить обработчик события.
		//handler - указатель на функцию или массив типа
		// [<указатель на функцию>, <guid>, <кол-во выполнений>, <данные передаваемые обработчику>]
		// <guid> может быть задан пустым объектом (или непустым) {} - в этом случае, guid будет заново создан
		// 
		// Например: 
		// - add($('elid'), 'click', [myonclick, 'myuniqueId', null, {somedata:'123'}]) - 
		//					В обрабтчик myonclick будет передан объект {somedata:'123'}. guid у обработчика будет "myuniqueId"
		// - add($('elid'), 'click', [myonclick, null, 1]) - Обработчик будет вызван один раз, после чего самоудалится
		// - add($('elid'), 'click', [myonclick, {}, 99]) - Для обработчика будет принудительно создан новый guid + он будет вызван 99 раз
		// - add($('elid'), 'click', myonclick)
		// Во всех случаях, когда <guid> указан или создаётся принудительно, если у функции myonclick уже был guid - она клонируется
		//  Новый guid возвращается функцией add
		//
		// ignoreHandlers - Массив указателей на функции ранее добавленные через Events.add, которые игнорируются во время выполнения _handler
		add: function(elem, type, handler, ignoreHandlers) {
			//Проверяем, не задана ли "пользовательская функция добавления"
			if(type in this.userAdd)return this.userAdd[type](elem, type, handler);
			
			//Если handler не Object(а точнее не Function), то пробуем разобрать его как массив
			//var handler;
			if(handler instanceof Array) {
				if(handler[1])handler[0].guid = handler[1];//Второй элемент массива - заданый guid. Назначаем его handle'у
				if(handler[2])handler[0].execCount = handler[2];//Третий элемент массива - кол-во выполнений
				var data = handler[3];//Четвёртый элемент массива - данные передающиеся в handler
				handler = handler[0];
			}

			// исправляем небольшой глюк IE с передачей объекта window
			if(elem.setInterval && (elem != window && !elem.frameElement))elem = window;

			//Назначить функции-обработчику уникальный номер. По нему обработчик можно будет легко найти в списке events[type].
			//Если мы передали в функцию свой guid - мы установили его выше.
			//Если guid является объектом - клонируем handler
			if(!handler.guid)handler.guid = ++guid;
			if(typeof handler.guid == 'object')(handler = cloneFunction(handler)).guid = ++guid;

			//Обрабатываем список игнорирований после получения функцией guid, чтобы функция могла добавить сама себя
			if(ignoreHandlers) {
				handler.ignoreGuids = [];
				var k = -1, s;
				//игнорирование по типу
				while(s = ignoreHandlers[++k])
					handler.ignoreGuids = handler.ignoreGuids.concat(Events.typeSinonims[s]);//Добавим синонимы
				handler.ignoreGuids = handler.ignoreGuids.concat(ignoreHandlers);//Добавим сами события
			}

			//Если заданы данные передающиеся в обработчик - инициализируем структуру, в которой будем хранить
			// указатели на данные, с ключом - handler.guid
			if(data) {
				if(!elem.eventsData)elem.eventsData = {};
				elem.eventsData[handler.guid] = data;
			}

			//Инициализовать служебную структуру events и обработчик handle. 
			//Обработчик handle фильтрует редко возникающую ошибку, когда событие отрабатывает после unload'а страницы. 
			//Основная же его задача - передать вызов универсальному обработчику commonHandle с правильным указанием текущего элемента this. 
			//Как и events, handle достаточно инициализовать один раз для любых событий.
			if(!elem.events) {
				elem.events = {};
				elem.handle = function(event) {
					if(event !== void 0)
						return commonHandle.call(elem, event);
				}
			}

			//Если обработчиков такого типа событий не существует - инициализуем events[type] и вешаем
			// elem.handle как обработчик на elem для запуска браузером по событию type.
			if(!elem.events[type]) {
				elem.events[type] = {};

				$addEventListener(elem, type, elem.handle);
			}

			//Добавляем пользовательский обработчик в список elem.events[type] под заданным номером. 
			//Так как номер устанавливается один раз, и далее не меняется - это приводит к ряду интересных фич.
			// Например, запуск add с одинаковыми аргументами добавит событие только один раз.
			elem.events[type][handler.guid] = handler;
			
			return handler.guid;
		},

		// удалить обработчик события
		remove: function(elem, type, handler) {
			var handlers = elem.events && elem.events[type];//Получить список обработчиков
			if(!handlers)return;

			if(!handler) {//Удаление всех обработчиков нужного типа. если handler не указан - убивать их все
		        for(var handle in handlers)if(handlers.hasOwnProperty(handle))
		            delete events[type][handle];
        		return;
    		}

			if(typeof handler != 'Object')delete handlers[handler];//Удалить обработчик по заданному guid
			else delete handlers[handler.guid];//Удалить обработчик по его номеру

			for(var any in handlers)if(handlers.hasOwnProperty(any))return;//TODO: проверить, что тут делается. Глупость какая-то.Проверить, не пуст ли список обработчиков
			//Если пуст, то удалить служебный обработчик и очистить служебную структуру events[type]
			$removeEventListener(elem, type, elem.handle);

			delete elem.events[type];

			//Если событий вообще не осталось - удалить events и handle за ненадобностью.
			for(var any in elem.events)if(elem.events.hasOwnProperty(any))return;
			try {
				delete elem.handle;
				delete elem.events;
			} catch(e) { //IE может выдать ошибку при delete свойства элемента, поэтому для него предусмотрен блок catch.
				elem.removeAttribute("handle");
				elem.removeAttribute("events");
			}
		}/*,

		//TODO::// приостановить обработчик события
		pause: function(elem, type, handler) {
			
			var handlers = elem.events && elem.events[type];//Получить список обработчиков
			if(!handlers)return;

			if(!handler) {//Удаление всех обработчиков нужного типа. если handler не указан - убивать их все
		        for(var handle in handlers)if(handlers.hasOwnProperty(handle))
		            delete events[type][handle];
        		return;
    		}

			if(typeof handler != 'Object')delete handlers[handler];//Удалить обработчик по заданному guid
			else delete handlers[handler.guid];//Удалить обработчик по его номеру

			for(var any in handlers)if(handlers.hasOwnProperty(any))return;//Проверить, не пуст ли список обработчиков
			//Если пуст, то удалить служебный обработчик и очистить служебную структуру events[type]
			if(elem.removeEventListener)elem.removeEventListener(type, elem.handle, false);
			else if(elem.detachEvent)elem.detachEvent("on" + type, elem.handle);

			delete elem.events[type];

			//Если событий вообще не осталось - удалить events и handle за ненадобностью.
			for(var any in elem.events)if(elem.events.hasOwnProperty(any))return;
			try {
				delete elem.handle;
				delete elem.events;
			} catch(e) { //IE может выдать ошибку при delete свойства элемента, поэтому для него предусмотрен блок catch.
				elem.removeAttribute("handle");
				elem.removeAttribute("events");
			}
		}*/
	}
}())

// !!Сейчас добавив DOMReady, его нельзя отменить - функция Events.Del не сработает или сработает неправильно
//TODO:: Добавить резервный вызов onload, если DOMContentLoaded сработало раньше, чем мы его повесили
Events.userAdd["DOMReady"] = function(el, type, _handler) {
	//TODO:: 
	// 1. Написать Events.userDel.attrchange, который будет удалять служебдые объекты DOMReady
	if(!_handler)return;
	
	//Если handler не Object(а точнее не Function), то пробуем разобрать его как массив
	if(_handler instanceof Array) {
		if(_handler[1])_handler[0].guid = _handler[1];//Второй элемент массива - заданый guid. Назначаем его handle'у
		if(_handler[2])_handler[0].execCount = _handler[2];//Третий элемент массива - кол-во выполнений
		var data = _handler[3],//Четвёртый элемент массива - данные передающиеся в handler
		//(!!!) Google Chorome (WebKit ?) почемуто не может правильно обработать конструкцию handler = handler[0];
		//(!!!) Google Chorome (WebKit ?) почемуто не даёт изменить свойство handler. Это пипец
			handler = _handler[0];
	}
	else handler = _handler;

	var guid = 0;

	//TODO:: ++guid - Автоматический guid - guid возвращенный функцией Events.add
	// для того, чтобы можно было по guid добавить в список игнорирования из функции opcHandler
	if(!handler.guid)handler.guid = ++guid;
	if(typeof handler.guid == 'object') (handler = cloneFunction(handler)).guid = ++guid;
			
	if(d.addEventListener) {//Нормальные браузеры
		Events.add(window, "DOMContentLoaded", [handler, null, null, data]);
	}
	else {//IE
		d.write("<script id=\"__ie_onload\" defer=\"defer\" src=\"javascript:void(0)\"><\/script>");
		var a = d.getElementById("__ie_onload");
		a.onreadystatechange = function(e) {
			var n = this;
			if(n.readyState == "complete")handler(e, handler, data);
		}
	}
}





/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Events  ======================================  */
/*  ======================================================================================  */


/*  ======================================================================================  */
/*  ==================================  Array.prototype  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

/*
From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
*/
Array.prototype.filter = Array.prototype['filter'] || function(fun, thisp) {  
	var len = this.length >>> 0;
	if (typeof fun != "function")throw new TypeError();  

	var res = [];
	for (var i = 0; i < len; i++)
		if (i in this) {  
			var val = this[i];// in case fun mutates this  
			if(fun.call(thisp, val, i, this))res.push(val);
		}

	return res;
}

//----- Добавляем в массив функциональность выполнения функции для всех элементов массива
/*[*]*/
//Убрал: 1.прерывание выполнения если iterator.call возв. false, т.к. это не соотв. стандартному поведению
//		 2.return this, т.к. это не соотв. стандартному поведению
if(!Array.prototype.forEach)Array.prototype.forEach = function(iterator, context) {
	for(i in this)if(this.hasOwnProperty(i))iterator.call(context, this[i], parseInt(i, 10), this);
	//Варианты:
	//	var v, i = -1;while(v = this[++i])iterator.call(context, v, i, this);
	// не подходит, т.к. не обрабатывают массив типа t = []; t[0]="0"; t[2]="2"; <- т.к. элемента
	//  с индексом 1 нету, на индексе 0 первый алгоритм остановится, а второй обработает t[1]
	//	for(var i = 0, l = this.length ; i < l; i++)iterator.call(context, this[i], i, this);
	// не подходит, т.к. будет вызван для undefine элементов, в этом случае t = []; t[0]="0"; t[2]="2"; <- элемента 1 == undefine
}

/**
 * Объединяет массив с другим массивом, пропуская повторяющиеся и undefined значения.
 * @version 4
 * @param {Array} list Добавляемый массив
 * @param {Function=} callback Функция для проверки добавляемого значения со всеми значениями исходного массива. Должна вернуть true, для того, чтобы элемент добавился
 */
Array.prototype.union = function(list, callback) {
	callback = callback || function(a, b) { return a != b }
	var result = this, newValue, value, isUnique, rl = result.length;
    
    for(var i = -1, ll = list.length ; newValue = list[++i], i < ll ; )if(newValue !== void 0) {
		isUnique = true;
		for(var j = -1 ; value = result[++j], j < rl && isUnique ; )isUnique = callback(value, newValue);
		if(isUnique)result.push(newValue);
	}
	
	return result;
}

/**
 * Добавляем все значения массива list в конец текущего массива this
 * @version 2
 * @param {Array} list Добавляемый массив
 */
Array.prototype.unionAll = function(list) {
	this.splice.apply(this, [this.length, 0].concat(list));
	return this;
}

if(!Array.prototype.indexOf)Array.prototype.indexOf = function(obj, n) {
	for(var i = n || 0, l = this.length ; i < l ; i++)
		if(this[i] === obj)return i;
	return -1;
}
if(!Array.prototype.lastIndexOf)Array.prototype.lastIndexOf = function(obj, i) {
	return this.slice(0).reverse().indexOf(obj, i)
}

/*/*
 * /БАГИ!/ЗАМЕНЕНА НА every(JavaScript 1.6)/Проверяет, чтобы каждый элемент массива соответствовал некоторому критерию
 * @deprecate
 * @param {Function} iterator критерий соответствия. По-умочанию - что элемент существует
 * @param {Object=} context Контент в рамках которого мы будем вызывать функцию 
 * @param {boolean=} noneed
 * @return {boolean}
 */
/*if(!Array.prototype.all)Array.prototype.all = function(iterator, context, noneed) {
	iterator = iterator || function(x){return x};
	var result = typeof noneed == undefType || noneed;//Default value = true
	this.forEach(function(value, index) {
		if(result == noneed)result = !!iterator.call(context, value, index);
	});
	return result;
}*/

/*/*
 * /БАГИ!//ЗАМЕНЕНА НА some(JavaScript 1.6)/Проверяет, чтобы хотябы один элемент массива соответствовал некоторому критерию
 * @deprecate
 * @param {Function} iterator критерий соответствия. По-умочанию - что элемент существует
 * @param {Object=} context Контент в рамках которого мы будем вызывать функцию
 * @return {boolean}
 */
/*if(!Array.prototype.any)Array.prototype.any = function(iterator, context) {
	return Array.prototype.all(iterator, context, false);//<-Ошибка
}*/

/**
 * Проверяет, чтобы каждый элемент массива соответствовал некоторому критерию [JavaScript 1.6]
 * @this {Object}
 * @param {Function} callback критерий соответствия. По-умочанию - что элемент существует
 * @param {Object=} opt_thisobj Контент в рамках которого мы будем вызывать функцию
 * @return {boolean}
 */
if(!Array.prototype.every)Array.prototype.every = function(callback, opt_thisobj, _isAll) {
	if(_isAll === void 0)_isAll = true;//Default value = true
	var result = _isAll;
	this.forEach(function(value, index) {
		if(result == _isAll)result = !!callback.call(opt_thisobj, value, index, this);
	});
	return result;
}

/**
 * Проверяет, чтобы хотябы один элемент массива соответствовал некоторому критерию [JavaScript 1.6]
 * @this {Object}
 * @param {Function} callback критерий соответствия. По-умочанию - что элемент существует
 * @param {Object=} opt_thisobj Контент в рамках которого мы будем вызывать функцию
 * @return {boolean}
 */
if(!Array.prototype.some)Array.prototype.some = function(callback, opt_thisobj) {
	return this.every(callback, opt_thisobj, false);
}

/**
 * 
 * EN: Creates a new array with the results of calling a provided function on every element in this array.
 * Production steps of ECMA-262, Edition 5, 15.4.4.19  
 * Reference: http://es5.github.com/#x15.4.4.19
 * @param {Function} callback Function that produces an element of the new Array from an element of the current one.
 * @param {Object?} thisArg Object to use as this when executing callback.
 * @return {Array}
 */
if (!Array.prototype.map)Array.prototype.map = function(callback, thisArg) {
    var T, Result, k;

    if(this == null)throw new TypeError(" this is null or not defined");  

	var O = Object(this),// 1. Let O be the result of calling ToObject passing the |this| value as the argument.  
		len = O.length >>> 0;// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".  
							 // 3. Let len be ToUint32(lenValue).  

	// 4. If IsCallable(callback) is false, throw a TypeError exception.  
	// See: http://es5.github.com/#x9.11  
	if ({}.toString.call(callback) != "[object Function]")
		throw new TypeError(callback + " is not a function"); 

	if(thisArg)T = thisArg;// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.  

	// 6. Let Result be a new array created as if by the expression new Array(len) where Array is  
	// the standard built-in constructor with that name and len is the value of len.  
	Result = new Array(len);  

	k = 0;// 7. Let k be 0  

	while(k < len) {// 8. Repeat, while k < len
		var kValue, mappedValue;  

		// a. Let Pk be ToString(k).  
		//   This is implicit for LHS operands of the in operator  
		// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.  
		//   This step can be combined with c  
		// c. If kPresent is true, then  
		if (k in O) { 
			kValue = O[ k ];// i. Let kValue be the result of calling the Get internal method of O with argument Pk.    

			// ii. Let mappedValue be the result of calling the Call internal method of callback  
			// with T as the this value and argument list containing kValue, k, and O.  
			mappedValue = callback.call(T, kValue, k, O);  

			// iii. Call the DefineOwnProperty internal method of Result with arguments  
			// Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},  
			// and false.  

			// In browsers that support Object.defineProperty, use the following:  
			// Object.defineProperty(Result, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });  

			// For best browser support, use the following:  
			Result[k] = mappedValue;  
		}
		// d. Increase k by 1.  
		k++;  
	}  

	return Result;// 9. return Result
};

/**
 * Проверка, является ли объект массивом
 * EN: Is a given value an array?
 * Delegates to ECMA5's native Array.isArray
 * @param {*} Проверяемый объект 
 * @return {boolean}
 */
Array.isArray = Array['isArray'] || function(obj) {
	return !!(obj && obj.concat && obj.unshift && !obj.callee);
};

/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Array.prototype  ==================================  */
/*  ======================================================================================  */

/*  ======================================================================================  */
/*  ================================  String.prototype  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

if(!String.prototype.trim)String.prototype.trim = function() {
	var	str = this.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while(ws.test(str.charAt(--i))){};
	return str.slice(0, i + 1);
}

/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  String.prototype  ==================================  */
/*  ======================================================================================  */

/*  ======================================================================================  */
/*  =======================================  Utils  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */
/**
 * Проверяет на наличие CSS-класса value у элемента element
 * @version 2.2
 * @param {!HTMLElement|Node} element
 * @param {!string} value
 * @return {boolean}
 */
var isCssClass = "classList" in browser.testElement ? 
	function(element, value) {return element["classList"].contains(value);}//HTML5 & JavaScript 1.8	
	:
	function(element, value) {
		if(!element.className)return false;
		return !!~(" " + element.className + " ").indexOf(" " + value + " ");
	}
/**
 * Удаляет CSS-класс value из списка классов элемента element
 * @version 2.2
 * @param {!HTMLElement|Node} element
 * @param {!string} value
 * @return {HTMLElement|Node} обработаный элемент element
 */
var removeCssClass = "classList" in browser.testElement ? 
	function(element, value) {return element["classList"].remove(value), element;}//HTML5 & JavaScript 1.8	
	:
	function(element, value) {
		var re = new RegExp("(^|\\s)" + value + "(\\s|$)", "g");
		element.className = element.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
		return element;
	}
/**
 * Добавляет к списку классов элемента element CSS-класс value
 * @version 2.2
 * @param {!HTMLElement|Node} element
 * @param {!string} value
 * @return {HTMLElement|Node} обработаный элемент element
 */
var addCssClass = "classList" in browser.testElement ? 
	function(element, value) {return element["classList"].add(value), element;}//HTML5 & JavaScript 1.8	
	:
	function(element, value) {
		var re = new RegExp("(^|\\s)" + value + "(\\s|$)", "g");
		if(re.test(element.className))return element;
		element.className = (element.className + " " + value).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
		return element;
	}
/**
 * Проверка, является ли объект числом
 * EN: Is a given value a number?
 * @param {!Object} obj
 * @return {boolean}
 */
function isNumber(obj) {
	//return (obj === +obj) || (toString.call(obj) === '[object Number]');
	return !isNaN(obj);
}

/**
 * Проверка, является ли объект объектом типа HTMLElement
 * @param {!Object} obj Проверяемый объект
 * @return {boolean}
 */
function isHTMLElement(obj) {
	try {
		if(obj instanceof Element)return true;
	}
	catch(e) {//IE doesn't give you access to the HTMLElement prototype
		try {
			if(obj.nodeType == 1)return true;
		}
		catch(b) {}
	}
	return false;
}

/**
 * Внешняя forEach для массивов и объектов
 * Не использует встроенный в Array метод forEach, для того, чтобы сделать прерывание по iterator.call() == false
 * Hint: Для Array вызывайте метод [].forEach()
 * @param {!Array|Object} obj Объект или массив, который будем перебирать
 * @param {!Function} iterator функция вызываемая для каждого найденного элемента
 * @param {Object=} context Контент в рамках которого мы будем вызывать функцию
 * @return {Array|Object} объект или массив obj
 */
function forEach(obj, iterator, context) {
	var hop = Object.prototype.hasOwnProperty;
	for(var key in obj)
		if(hop.call(obj, key)) if(iterator.call(context, obj[key], key, obj) === false)break;
    return obj;
}
/**
 * Повторение строки
 * @param {!string} str Исходная строка
 * @param {!number} count Кол-во повторений
 * @return {string} Результирующая строка
 */
function repeatString(str, count) {
	return Array(++count).join(str);
	/*OLD:
	var / @type {string} /s = "";
	while(count-- > 0)s += str;
	return s;*/
}

/**
 * Создание произвольной строки
 * !!! ВНИМАНИЕ !!! Результирующая строка ~ в 5% случаев будет длинной length - 1
 * @param {!number} length Размер строки
 * @return {string}
 */
function randomString(length) {
	/*Вместо вызова функции repeatString вставил тело этой функции - для улучшения производительности*/
    return (Math.round(Math.random() * parseInt(Array(++length).join("z"), 36))).toString(36);//36 - 0-9a-z
}
/* OLD::
function randomString(length) {
    //var cs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    var cs = '0123456789abcdefghiklmnopqrstuvwxyz'.split('');
    
    var / @type {string} /str = '', 
    	/ @type {number} /csl = cs.length, 
    	/ @type {number} /i = -1,
    	/ @type {number} /l = length || Math.floor(Math.random() * csl);
    while (++i < l)str += cs[Math.floor(Math.random() * csl)];
    return str;
}
*/

/** Переименовал в getStyleDiff
 * @deprecate
 */
function StyleStringDiff() {

}
/**
 * Находит разность между двумя css-строками и возвращяет её в виде объекта.
 * Каждое свойство обекта - массив в 0-м элмента значение из oldStyleStr, в 1-м изnewStyleStr.
 * В объекте присутствуют только те свойства, которые различались в двух строках
 * @param {!CSSStyleDeclaration|string} oldStyleStr CSSStyleDeclaration или Строка CSS-стилей в виде [attrName]:[attrValue];[attrName]:[attrValue];...
 * @param {!CSSStyleDeclaration|string} newStyleStr CSSStyleDeclaration или Строка CSS-стилей в виде [attrName]:[attrValue];[attrName]:[attrValue];...
 * @return {Object} Объект содержащий разность CSS-стилей между oldStyle и newStyle.
 * @version 3
 *  changeLog: 3 [16.06.2011]Переименовал с StyleStringDiff на getStyleDiff. Переписал логику работы
 */
function getStyleDiff(oldStyle, newStyle) {
	if(!oldStyle || !newStyle)return {};
	
	if(!getStyleDiff.testElement)getStyleDiff.testElement = document.createElement("div");
	if(!getStyleDiff.defaultProps)
		getStyleDiff.defaultProps = {"cssText" : 0, "length" : 0, "parentRule" : 0, "__proto__" : 0};//Закешируем свойства не относящиеся к CSS
	
	if(typeof oldStyle == "string")oldStyle = oldStyle.replace(/ /g, '');//Удаляем пробелы
	if(typeof newStyle == "string")newStyle = newStyle.replace(/ /g, '');

	/**
	 * Функция разбирает css-строку str и создаёт массив объект со значаниями - массивами.
	 * Название свойства в лбъекте - название css-свойства из str. Первый элемент массива -
	 *  значение свойства из css-строки str, второй - значение свойства из объекта prev
	 *  (созданного этойже функцией).
	 * По сути, функция вызывается два раза - первый раз без указания объекта prev, второй -
	 *  с объектом prev равным результату работы предыдущего вызова функции
	 * В результате двойной работы функции в результирующем объекте остаются только свойства,
	 *  которые имели разные значения в str и prev 
	 * @param {!Object|string} props Объект-список css-стилей или строка CSS-стилей, без пробелов в виде [attrName]:[attrValue];...
	 * @param {Object=} prev Объект - Результат работы этойже функции. При первом вызове неуказывается
	 * @return {Object} Объект с ключами - списком CSS-свойств и со свойствами - массивами из двух значений 
	 */
	function _getStyleDiff(props, prev) {
		var style = prev || {}, p, s;
		
		if(typeof props == "string") {
			getStyleDiff.testElement.style.cssText = props;
			props = getStyleDiff.testElement.style;
		}
		for(p in props)if((!props.hasOwnProperty || props.hasOwnProperty(p)) && 
						  !(p in getStyleDiff.defaultProps)) {//p не является свойством по-умолчанию (cssText, length и т.д.)
			if(isNumber(p))p = props[p];//Google Chrome (возможно Webkit) выдаёт вместо названия свойства номер
			if(prev) {//Сравнивается с предыдущим стилем и оставляется только разница
				if((s = prev[p] && prev[p][0] || "") != props[p])style[p] = [s, props[p]];
				else delete style[p];//Удалим свойство, если значение его не изменилось
			}
			else style[p] = [props[p], null];
		}
		
		return style;
	}

	return _getStyleDiff(newStyle, _getStyleDiff(oldStyle));
}

/**
 * Функция возвращает текущее название функции
 * @param {!Function} func - указатель на функцию
 * @version 2
 */
function getFunctionName(func) {
	if(typeof func != funcType)return "";
	if(!func.name) {
		var s = func.toString().replace("function ", "");
		return s.substr(0, s.indexOf("("));
	}
	return func.name;
}

/**
 * Преобразует 'Array-like коллекцию с числовыми ключами'/число/строку в массив.
 * Можно задать выборку через start и end. Трактовка start и end аналогичная функции Array::slice
 *  Если start отрицателен, то он будет трактоваться как arrayObj.length+start (т.е. start'ый элемент с конца массива). 
 *  Если end отрицателен, то он будет трактоваться как arrayObj.length+end (т.е. end'ый элемент с конца массива).
 *  Если второй параметр не указан, то экстракция продолжится до конца массива. Если end < start, то будет создан пустой массив.
 * @version 2.3.2
 *  changeLog: 2.3.2[15.09.2011] Добавил проверку на кол-во результирующих элементов в результате выполнения Array.prototype.slice
			   2.3.1[19.05.2011] В секцию if(type == "object") { for(i in iterable)... Добавил проверку на наличие hasOwnProperty, а то в IE, у некоторых объектов этой функции нету
 *			   2.3  [14.04.2011] Переписал логику start и end
 *			   2.2  [13.04.2011] +@param forse для typeof iterable == "object"
 *			   2.1  [11.04.2011] Сделал несколько исключений для IE < 9
 *			   2    [09.04.2011] Переписал логику работы. Теперь принимает больше типов данных
 *			   1    [--.--.2010] First version from prototypejs (prototypejs.org) with no iterable.toArray section
 * @param {Object|Array|number|string|NodeList} iterable Любой Array-like объект, любой объект, число или строка
 * @param {number=} start Индекс элемента в массиве, с которого будет начинаться новый массив.
 * @param {number=} end Индекс элемента в массиве, на котором новый массив завершится.
 * @param {boolean=} forse Для typeof iterable == "object" смотреть свойства в цепочки прототипов объекта
 * @return {Array}
 * @example $A(iterable) -> actualArray
 */
function $A(iterable, start, end, forse) {
	if(!iterable || start + end === 0)return [];
	start = start || 0;//Default value
	end = end || 0;//Default value
	
	var type = typeof iterable, results, trySlice = true,
		//args потому, что IE не понимает, когда в функцию Array::slice передают undefined вместо start и/или end
		args = [start];
	if(end)args.push(end);
	
	if(type == "number")iterable += "";
	
	//IE не умеет выполнять Array.prototype.slice для "string" и "number"
	if(browser.msie < 9 && (type == "number" || type == "string"))trySlice = false;
	
	if(typeof iterable.length == "number") {
		if(trySlice) try {//Попробуем применить Array.prototype.slice на наш объект
 			results = Array.prototype.slice.apply(iterable, args);//An idea from https://github.com/Quby/Fn.js/blob/master/fn.js::_.toArray
			//Match result length of elements with initial length of elements
			if(results.length == iterable.length)return results;
		}
		catch(e) {//IE throw error with iterable == "[object NodeList]"
			//не получилось! -> выполняем обычную переборку
		}
		
		results = [];
		var i = start, length = end ? (end < 0 ? iterable.length + end : end) : iterable.length;
		if(i < 0 && (i = (length + i), i) < 0)i = 0;
		if(length > iterable.length)length = iterable.length;
		else if(length < 0)length = 0;
		for( ; i < length ; ++i)results.push(iterable[i]);
        //for(var i = -1, l = iterable.length, v ; v = iterable[++i], i < l ; )if(v != void 0)results.push(v);
		
		return results;
	}
	
	results = [];
	
	if(type == "object") {
		for(var i in iterable)if(forse || !iterable.hasOwnProperty || iterable.hasOwnProperty(i))results.push(iterable[i]);
		return !start && !end && results || results.slice.apply(results, args);
	}
	
	return results;	
}

/**
 * Достаёт ключи объекта/массива и возвращяет их в виде массива
 * @param {Object|Array|number|string} iterable
 * @param {boolean=} forse Для typeof iterable == "object" смотреть свойства в цепочки прототипов объекта
 * @version 2.5
 *  changeLog: 2.5[16.06.2011] [*bug]В IE. Не доставал ключи, если iterable это arguments
			   2.1[31.05.2011] Вернул параметр forse для type == "object"
			   2  [24.05.2011] Добавил обработку number и string. Добавил вызов Object.keys, который должен быть реализован. Убрал параметр forse, т.к. не соответствует сигнатуре Object.keys
 *			   1  [--.04.2011] Initial realese
 */
function $K(iterable, forse) {
	var type = typeof iterable,
		length,
		results;
		
	if(type == "object") {
		if(browser.msie && iterable.length && !(iterable instanceof Array))iterable = $A(iterable);//Если Arguments
		if(forse) {
			results = [];
			for(var i in iterable)results.push(i);
			return results
		}
		return Object.keys(iterable);
	}
	
	if(type == "number" || type == "string")length = (iterable + "").length;
	else if(typeof iterable.length == "number")length = iterable.length;
	else throw new TypeError('$K:non-iterable');
	
	results = [];
	if(length != void 0)for(var i = 0 ; i < length ; ++i)results.push(i);
	return results;
}

/**
 * From prototypejs (prototypejs.org)
 * Создаёт функцию с определёнными объектом this и параметрами вызова
 * ENG: Wraps the function in another, locking its execution scope to an object specified by thisObj.
 * @param {Object} object
 * @param {...} var_args
 * @return {Function}
 * @version 2
 */
if(!Function.prototype["bind"])Function.prototype["bind"] = Function.prototype.bind = function(object) {
	var __method = this, args = Array.prototype.slice.call(arguments, 1);
	return function() {
		return __method.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
	}
}


/* JSON JavaScript implementation */
/* Реализуем минимальную функциональность JSON */
if(typeof JSON == undefType)JSON = {
	parse : function(text) {
		return text && !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
			eval('(' + text + ')') || null;
	}
}

/**
 * Функция динамически подгружает flash-ролик, беря данные для ролика из elements
 *   не будут, т.к. алгоритм остановится на innerSWF1.
 * @param {string} elements Элементы, с которыми ассоциированы флеш-ролики
 * @return {number} Кол-во активированых роликов
 * @version 2.3
 */
function swfActivate(elements) {
	var flashName = "Shockwave Flash",
		macro = "innerSWF", i = 0, el, srcParam = "data-data", 
		attrs = ["data", "type", "class", "width", "height", "align"],
		params = ["bgcolor", "menu"], aliases = {},
		/** @type {boolean} Флаг, установлен ли flash-плеер */
		isFlash = true;
	
	if(!elements)return 0;
	if(typeof elements == "string")elements = $$(elements);
	else if(!Array.isArray(elements))elements = [elements];
	
	if(browser.msie < 9) {
		params.push("movie");
		aliases["movie"] = "data";
		try {
			new ActiveXObject((flashName + "." + flashName).replace(" ", ""));//"ShockwaveFlash.ShockwaveFlash"
		}
		catch(e) {isFlash = false}
	}
	else {
		isFlash = !!navigator.plugins[flashName];
	}
		
	//data-type="application/x-shockwave-flash"
	
	/** 
	 * @param {HTMLElement} el1
	 * @param {HTMLIFrameElement|Node=} frame */
	function swfActive(el1, frame) {
		var v,
			object = "<object type='application/x-shockwave-flash' ";
			
		//Убираем "мигание", когда первый кадр флешки залит белым цветом
		object += "style='visibility:hidden' "; 
			
		attrs.forEach(function(attr){
			if(v = el1.getAttribute("data-" + attr))object += (attr + "='" + v + "' ");
		});
		object += ">";
		params.forEach(function(param, i) {
			var name = aliases[param] || param;
			if(v = el1.getAttribute("data-" + name))object += "<param name='" + param + "' value='" + v + "' />";
		});
		object += "</object>";
		el1.innerHTML = object;
		
		//Убираем "мигание" в Opera и FF, когда первый кадр флешки залит белым цветом 
		setTimeout(function(){
			el1.getElementsByTagName("OBJECT")[0].style.visibility = "";
		}, 500);
		
		//Убираем IFRAME. 500 - задержка, чтобы небыло "бесконечной загрузки" в FF(например)
		if(frame)setTimeout(function(){document.body.removeChild(frame)}, 500);
	}
	
	function swfTurnOnOrDownload(el) {
		//TODO:: Показывать ссылку на скачать flash-плугин и сообщение о том, что данный flash-ролик необходим для работы сайта
	}
	
	while(el = elements[i++]) {
		if(isFlash) {
			//В IE прелоадер не работает, т.к. IE предлагает сохранить ролик как файл
			//TODO:: Придумать прелоадер для IE. 
			if(el.hasAttribute("data-nopreload") || browser.msie) {
				swfActive(el);
			}
			else {
				//Форсируем предзагрузку flash-ролика, перед его выводом
				var fr = document.createElement("iframe"), v = el.getAttribute(srcParam), f = swfActive.bind(window, el, fr);
				fr.src = v;
				fr.onload = f;
				if(!fr.onload) {
					//В IE, например, нету события onload для iframe, но зато можно повесить это событие через attachEvent 0_O
					Events.add(fr, 'load', f);
				}
				fr.style.visibility = "hidden";
				fr.style.position = "absolute";
				fr.style.top = fr.style.width = fr.style.height = "1px";
				document.body.appendChild(fr);
			}
		}
		else if(el.getAttribute("data-required"))swfTurnOnOrDownload(el);
	}
	
	return --i;
}

/**
 * Транслитерация URL
 * http://ru.wikipedia.org/wiki/Транслитерация
 * @param {string} string Кирилическая строка для транслитерации
 * @param {number} mode 0 или 1, Модификатор для различного представления букв "ж","ш","ё" - 0:"zh","shh","jo", 1:"j","shch","e"
 */
function urlLit(string, mode) {
	var alphabet = 'a b v g d e ["zh","j"] z i y k l m n o p r s t u f h c ch sh ["shh","shch"] ~ y ~ e yu ya ~ ["jo","e"]'.split(' '),
		result = '', code, ch;
	string = string.toLowerCase().replace(/ /g,'-');
	for(i = 0, l = string.length ; i < l ; ++i) { 
		code = string.charCodeAt(i);
		ch = (code >= 1072 ? alphabet[code - 1072] : string[i]); 
		if(ch.length < 3)result += ch;
		else result += eval(ch)[mode];//TODO: Подумать как тут можно избавится от eval
	}
	return(result.replace(/~/g,''));
}


/**
 * Запускает функцию в отдельном контексте. Вызов происходит синхронно
 * /EN: creates a wrapper for function that allows you to not be afraid of exceptions in
 * Источник: @link {http://javascript.ru/forum/48731-post38.html}
 * Usage:
	var inverse= FThread(function( a ){
		if( a === -1 ) (void 0)()
		if( a === 0 ) throw Error( 'division by zero' )
		return 1/a
	})
	alert([ inverse( -1 ), inverse( 0 ), inverse( 1 ) ])
	// alerts ",,1" and two exceptions in console log
 * @param {Function} proc Функция, которую нужно выполнить в отдельном контексте
 * @return {Function} функция-обёртка для вызова
 */
var FThread = function(proc) {
    var thread = function() {
        var res, thisObj = this, args = arguments,
			starter = new XMLHttpRequest;
        starter.onreadystatechange = starter.onabort = function(ev) {
        	starter.onreadystatechange = starter.onabort = null;
		    res = thread.proc.apply(thisObj, args);
		}
        starter.open('get', '#', true);
        starter.send(null);
        starter.abort();
        return res;
    }
    thread.proc = proc;
    return thread;
}

/**
 * Создаёт универсальный обработчик для всех или нескольких вложенных элементов
 * В качестве обработчика можно передавать хеш-массив(Object) или функцию.
 *  Если обработчик-хеш-массив(Object), то вызывается функция по значению найденного атрибута.
 *  Первым параметром передаётся элемент, в котором был найден атрибут. 
 *  Вторым параметром передаётся найденное значение атрибута. В последующие параметры передаются
 *   другие найденные атрибуты, если attribute-массив.
 * 
 * @param {string|Array.<string>} attribute Название атрибута по которому будет определятся функция для вызова из namedFunctions. Или массив атрибутов, первый из которых - название функции для вызова, остальные будут получены и переданы в функцию в качестве параметров вызова
 * @param {Function|Object} namedFunctions Функция или Именованный хеш-массив(Object) функций типа: {"a" : funcA, "b" : funcB}
 * @param {Object?} context Контекст в рамках которого будет вызыватся функция
 * @param {boolean?} allowMany Default:false, Разрешить множественный вызов. Функция продолжит поиск обработчиков при нахождении первого
 * @return {function(Event)} Событие для кнопок. "Вешается" DOM-функцияей addEventLintener. Должно быть подготовлено к использованию в IE
 * TODO:: Сделать правильную обработку атрибута "class"
 */
function bubbleEventListener(attribute, namedFunctions, context, allowMany) {
	if(DEBUG) {
		if(!namedFunctions || 
		   (typeof namedFunctions != "object" && typeof namedFunctions != "function"))	
				Log.err("bubbleEventListener::namedFunctions must be an Object or Function")
		else if(typeof namedFunctions == "object") {
			if(!$A(namedFunctions).length)Log.err("bubbleEventListener::no functions are sets")
			else {
				var s = true;
				$K(namedFunctions).forEach(function(key){
					if(typeof namedFunctions[key] != "function")s = false;
				})
				if(!s)Log.err("bubbleEventListener::all values in namedFunctions MUST be a Functions")
			}
		}
		if(Array.isArray(attribute) && !attribute.length)Log.err("bubbleEventListener::в массиве attribute должен быть хотябы один элемент")
	}

	var _attr = (Array.isArray(attribute) ? attribute[0] : attribute).toLowerCase();
	
	return function(event) {
		var elem = event.target || (event.target = event.srcElement),
			/** @type {HTMLElement} Элемент, на котором останавливаем поиски action'а */
			stopElement = this,//Контекст this у функции !!!ДОЛЖЕН!!! указываеть на элемент, на который эту функцию повесили в качестве обработчика
			/** @type {string} Значение атрибута - имя функции */
			elemAttr,
			params = [],//Параметры вызова функции для apply()
			f,//Функция для вызова
			result;
		
		if(_attr == "class") {//Только для аттрибута "class" делаем исключение
			//TODO:: Сделать, чтобы имя функция вызывалась даже тогда, когда в аттребуде "class" больше одного класса
		}
		
		do {
			if(!(elemAttr = elem.getAttribute(_attr)))continue;
			
			params.push(event);
			params.push(elemAttr);
			if(Array.isArray(attribute) && attribute.length > 1)
				for(var i = 1, l = attribute.length ; i < l ; ++i)params.push(elem.getAttribute(attribute[i]));
			
			if(typeof namedFunctions == "function")result = namedFunctions.apply(context, params);
			else {
				if(f = namedFunctions[elemAttr])result = f.apply(context, params);
				else if(DEBUG)Log.log("bubbleEventListener::нету функции с названием " + elemAttr);
			}
			
			if(!allowMany)break;
		} while(elem != stopElement && (elem = elem.parentNode));
		
		return result;
	}
}


/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Utils  ======================================  */
/*  ======================================================================================  */

/*  ======================================================================================  */
/*  =====================================  Math Utils  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */
/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!! TODO:: Добавить всю секцию в mixolog.ru */

/**
 * Разуплотняет матрицу заполняя соседние клетки значениями в текущей клетке
 * @param {Array.<Array.<*>>} M Матрица
 * @param {number} unpackX  Кол-во заполяемых клеотк по горизонтали
 * @param {number} unpackY  Кол-во заполяемых клеотк по вертикали
 */
function unpackMatrix(M, unpackX, unpackY) {
	unpackX = unpackX + 1 || 1;
	unpackY = unpackY + 1 || 1;
	var i = -1, k, M1, M2, newM = [], g0, g1, g2;
	while(M1 = M[++i]) {
		k = -1;
		//newM[i] = [];
		while(M2 = M1[++k]) {
			g0 = i * unpackX;
			for(var h1 = 0 ; h1 < unpackX ; h1++) {
				g1 = g0 + h1;
				g2 = k * unpackY;
				for(var h2 = 0 ; h2 < unpackY ; h2++) {
					if(!newM[g1])newM[g1] = [];
					newM[g1][g2 + h2] = M2;
				}
			}
		}
	}
	return newM;
}

/*  ======================================================================================  */
/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Math Utils  =====================================  */


/*  ======================================================================================  */
/*  ========================================  DOM  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */
/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!! TODO:: Добавить $, $$n, $$0, $$ в mixolog.ru */

/**
 * Получение элемента по ID и добавление в него объекта-контейнера '_'. '_' можно использовать для хранения переменных,
 *  связанных с данным элементом, чтобы не захламлять пространство имён объекта
 * @param {!string|HTMLElement} id
 * @return {HTMLElement} найденный элемент
 */
function $(id) {
	if(typeof id == 'string')id = d.getElementById(id);
	
	if(id && !id._)id._ = {};
	
	return id;
};

/**
 * Функция возвращяет массив элементов выбранных по CSS3-велектору. 
 * Также добавляет во все наёденные элементы объекты-контейнеры '_'. '_' можно использовать для хранения переменных,
 *  связанных с данным элементом, чтобы не захламлять пространство имён объекта
 * //TODO:: '_'
 * Множественные селекторы, разделённые знаком "," не поддерживаются (смотрите функцию $$)
 * Вызывается querySelector, если поддерживается браузером
 * Данная функция поддерживает отличный от стандартного синтаксис: 
 * - Поддерживаются первые символы в селекторе - ">", "+" или "~".
 *  --!!! Побочный эффект: Если в браузере есть querySelector, то для каждого элемента из массива roots будет
 *        добавлен аттрибут "id", если его нету.
 * - Поддерживаются нестандартные псевдо-классы:
 *  -":parent"
 *  -":text-only" Только если элемент не содержит вложеных элементов - только, если содержит текст или пустой
 *    http://alastairc.ac/2006/10/text-nodes-and-css/
 *  TODO:: ."::textNode" for selecting text nodes (ode.nodeType == 3)
 *
 * @param {!string} selector CSS3-селектор
 * @param {Document|HTMLElement|Node|Array.<HTMLElement>=} roots Список элементов в которых мы будем искать
 * @param {boolean=} isFirst ищем только первый
 * @return {Array.<HTMLElement>}
 * @version 1.5.4
 *  changeLog: 1.5.4 [11.07.2011 13:58] [*Bug]Включил поддержку символа "-" в названиях класса и идентификатора
 *			   1.5.3 [25.05.2011 13:42] [*Bug]Исправил баг с CSS-аттрибут-селектором '&='
 *			   1.5.2 [11.05.2011 13:36] [*Bug]Исправил баг, когда пытался получить tagName у childNodes[n] у которого nodeType != 1
 *			   1.5.1 [06.05.2011 14:34] [*Bug]Поправил баг появляющийся в "strict mode", когда mod не был объявлен
 * 			   1.5   [05.05.2011 17:03] [*Bug]Свойство tagName сравнивалось с tag из селектора в неправильном регистре
 *			   1.4.1 [09.04.2011  1:00] Имплементация нестандартных псевдо-классов :parent и :text-only
 *			   1.4   [09.04.2011  0:40] [*Bug]Элемент по-умолчанию должен быть document(было document.body)
 *			   1.3.1 [22.03.2011 13.05] [*Bug]Исправил баг со свойством $$N.str_for_id (добавил букву "r" в начало)
 *             1.3   [21.03.2011 19.21] [*Bug]Исправил баг с селектором вида ",<selecrot>" при использовании querySelector
 *             1.2   [23.02.2011 20:50] Изменён алгоритм вызова querySelector если первый символ в selector = [>|+|~]
 *  TODO:: Изучить код https://github.com/ded/qwery - может быть будет что-нибуть полезное
 */
function $$N(selector, roots, isFirst) {
	//TODO:: Не засовывать в result те элементы, которые уже были туда засованы
	roots = !roots ? [d] : (Array.isArray(roots) ? roots : [roots]);
	
	var /** @type {Array.<HTMLElement>} */result = [],
		/** @type {Node|Window|HTMLElement} */rt,
		/** @type {HTMLElement} */child,
		/** @type {number} */ir = -1,
		/** @type {number} */kr;
	
	if(d.querySelector && !$$N.nonStandartPseudoClasses.regExp.test(selector)) {
		var /** @type {boolean} */isSpecialMod,
			/** @type {boolean} */noway = false,
			/** @type {string} */specialSelector;
			
		/* replace not quoted args with quoted one -- Safari doesn't understand either */
        if(browser.safary)
			selector = selector.replace(/=([^\]]+)/, '="$1"');
		
		if(selector.charAt(0) == ",")selector = selector.substr(1);
		isSpecialMod = /[>\+\~]/.test(selector.charAt(0));
        //TODO:: Тут ошибка. Селекторы вида ">*" не работают
		
		while(rt = roots[++ir]) {
			if(isSpecialMod) {
				if(rt == d)noway = true;//[MARK#1]У document нету parentNode, поэтому мы не можем выполнить на нём querySelector
				else {
					if(!rt.id)rt.id = $$N.str_for_id + $$N.uid_for_id++;
					specialSelector = "#" + rt.id + selector;
					rt = rt.parentNode;
				}
			}
			else specialSelector = selector;
			if(noway){}
			else if(isFirst)result.push(rt.querySelector(specialSelector));
			else result = result.concat($A(rt.querySelectorAll(specialSelector)));
		}
		
		if(!noway)return result;
	}
	
	
	//TODO:: Реализовать концепцию isFirst ниже
	//\.(.*?)(?=[:\[]|$) -> <.class1.class2>:focus or tag#id<.class1.class2>[attr*=value]
	//param css3Attr Пример: [attr*=value]
	//param css3Mod Пример: :nls-child(2n-0)
	selector = selector.match(/^([,>+~ ])?(\w*)(?:|\*)\#?([\w-]*)((?:\.?[\w-])*)(\[.*?\])?\:?([\w\-\+\%\(\)]*)$/);
	var mod = selector[1];
	var /** @type {string} */tag = selector[2].toUpperCase(),
		/** @type {string} */id = selector[3],
		/** @type {string|Array.<string>} */classes = selector[4],
		/** @type {boolean} */isClasses = !!classes,
		/** @type {string|Array.<string>} */css3Attr = selector[5],
		/** @type {string|Array.<string>} */css3Mod = selector[6];//Pseudo-classes
	switch(mod) {
		default://mod == ' ' || mod == ','
			if(id) {
				child = document.getElementById(id);
				if(!tag || child.tagName.toUpperCase() == tag)result.push(child);
				id = "";
			}
			else if(isClasses) {
				classes = $$N.getElementsByClassName1.analisClasses(classes);
				
				while(roots[++ir])//TODO:: Не засовывать в result те элементы, которые уже были туда засованы
					$$N.getElementsByClassName1(classes, tag, roots[ir], result);
				
				isClasses = false;
			}
			else {
				while(rt = roots[++ir]) {//TODO:: Не засовывать в result те элементы, которые уже были туда засованы
					kr = -1;
					var elements = (!tag && rt.all) ? rt.all : rt.getElementsByTagName(tag || "*");
					while(elements[++kr])result.push(elements[kr]);
				}
			}
		break;
		case '+':
			while(rt = roots[++ir]) {
				while((rt = rt.nextSibling) && rt.nodeType != 1){};
				if(rt && (!tag || rt.tagName.toUpperCase() == tag))result.push(rt);
			}
		break;
		case '~'://W3C: "an F element preceded by an E element"
			while(rt = roots[++ir]) {
				while (rt = rt.nextSibling) {//TODO:: Не засовывать в result те элементы, которые уже были туда засованы
					if(rt.nodeType == 1 && (!tag || rt.tagName.toUpperCase() == tag))result.push(rt);
				}
			}
		break;
		case '>'://W3C: "an F element preceded by an E element"
			while(rt = roots[++ir]) {
				kr = -1;
				while(child = rt.childNodes[++kr])
					if(child.nodeType == 1 && (!tag || child.tagName.toUpperCase() == tag))result.push(child);
			}
		break;
	}
	
	if(result.length && (isClasses || css3Attr || css3Mod || id)) {
		var i = 0, rs, match;
	    if(isClasses)classes = (" " + classes.slice(1).replace(/\./g, " | ") + " ").split("|");
	
		while(rs = result[i++]) {
			match = !(id && rs.id != id);
			
			if(match && isClasses) {
				var k = -1, rsClName = ' ' + rs.className + ' ';
				while(classes[++k] && match)
					match = ~rsClName.indexOf(classes[k]);
			}
			if(match && css3Attr) {
				if(typeof css3Attr == 'string') {//Check, if we not analys css3Attr yet
					css3Attr = css3Attr.match(/^\[(.*?)(?:([\*~&\^\$\|!]?=)(.*?))?\]$/);
					if(css3Attr[1] == "class" && document.all)css3Attr[1] = "className";//IE
				}
				
				var value1 = rs.getAttribute(css3Attr[1]), 
					value2 = css3Attr[3];
				
				// TODO: Проверить, что все опреации ^=, !=, *= и т.д. работают или ввести value1 = rs.getattribute(); if(value1)value1 = value1 + ''
				/* from yass 0.3.9 http://yass.webo.in/
				   and edited by me :) */
				/* function calls for CSS2/3 attributes selectors */
				switch(css3Attr[2]) {
				/* W3C "an E element with a "value1" attribute" */
					default://css3Attr[2] == ''
						match = !!value1 || value1 === "";
					break;
				/*
				W3C "an E element whose "value1" attribute value2 is
				exactly equal to "value2"
				*/
					case '=':
						match = value1 && value1 === value2;
					break;
				/*
				from w3.prg "an E element whose "value1" attribute value2 is
				a list of space-separated value2s, one of which is exactly
				equal to "value2"
				*/
					case '&=':
						match = value1 && (new RegExp('(^| +)' + value2 + '($| +)').test(value1));
					break;
				/*
				from w3.prg "an E element whose "value1" attribute value2
				begins exactly with the string "value2"
				*/
					case '^=':
						match = value1 && !value1.indexOf(value2);
					break;
				/*
				W3C "an E element whose "value1" attribute value2
				ends exactly with the string "value2"
				*/
					case '$=':
						match = (value1 && value1.indexOf(value2) == value1.length - value2.length);
					break;
				/*
				W3C "an E element whose "value1" attribute value2
				contains the substring "value2"
				*/
					case '*=':
						match = (value1 && ~value1.indexOf(value2));
					break;
				/*
				W3C "an E element whose "value1" attribute has
				a hyphen-separated list of value2s beginning (from the
				left) with "value2"
				*/
					case '|=':
						match = (value1 && (value1 === value2 || !!value1.indexOf(value2 + '-')));
					break;
				/* value1 doesn't contain given value2 */
					case '!=':
						match = (!value1 || !(new RegExp('(^| +)' + value2 + '($| +)').test(value1)));
					break;
				};
			}
			if(match && css3Mod) {
				//In this block we lose "rs" value
				if(typeof css3Mod == 'string') {
					css3Mod = css3Mod.match(/^([^(]+)(?:\(([^)]+)\))?$/);/* regexpt from jass 0.3.9 (http://yass.webo.in/) rev. 371 line 166 from right */
					//TODO:: Не работает nth-child и nth-last-child - путаница с nodeIndex
					if(css3Mod[2]) {
						if(!/\D/.test(css3Mod[2]))css3Mod[2] = [null, 0, '%', css3Mod[2]];
						else if(css3Mod[2] === 'even')css3Mod[2] = [null, 2];
						else if(css3Mod[2] === 'odd')css3Mod[2] = [null, 2, '%', 1];
						else css3Mod[2] = /(?:(-?\d*)n)?(?:(%|-)(\d*))?/.exec(css3Mod[2]);/* regexpt from jass 0.3.9 (http://yass.webo.in/) rev. 371 line 181 ( mod === 'nth-last-child' ?...) */
					}
				}
				//TODO:: Не работает nth-child и nth-last-child - путаница с nodeIndex
				/* from yass 0.3.9 http://yass.webo.in/ */
				/*
				function calls for CSS2/3 modificatos. Specification taken from
				http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
				on success return negative result.
				*/
				switch(css3Mod[1]) {
				/* W3C: "an E element, first rs of its parent" */
					case 'first-child':
				/* implementation was taken from jQuery.1.2.6, line 1394 */
						match = rs.parentNode.getElementsByTagName('*')[0] == rs;
					break;
				/* W3C: "an E element, last rs of its parent" */
					case 'last-child'://In this block we lose "rs" value
				/* loop in lastrss while nodeType isn't element */
						while ((rs = rs.nextSibling) && rs.nodeType != 1) {}
				/* Check for node's existence */
						match = !rs;
					break;
				/* W3C: "an E element, root of the document" */
					case 'root':
						match = rs.nodeName.toLowerCase() == 'html';
					break;
				/* W3C: "an E element, the n-th rs of its parent" */
					case 'nth-child':
						var ind = css3Mod[2],
							c = rs.nodeIndex || 0,
							a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
							b = ind[1];
				/* check if we have already looked into siblings, using exando - very bad */
						if (c) {
							match = !b ? !(c + a) : !((c + a) % b);
						}
						else {
							match = false;
				/* in the other case just reverse logic for n and loop siblings */
							var brother = rs.parentNode.firstChild;
				/* looping in child to find if nth expression is correct */
							do {
				/* nodeIndex expando used from Peppy / Sizzle/ jQuery */
								if (brother.nodeType == 1 && (brother.nodeIndex = ++c) && rs === brother && (!b ? !(c + a) : !((c + a) % b))) {
									match = true;
								}
							} while (!match && (brother = brother.nextSibling));
						}
					break;
				/*
				W3C: "an E element, the n-th rs of its parent,
				counting from the last one"
				*/
					case 'nth-last-child':
				/* almost the same as the previous one */
						var ind = css3Mod[2],
							c = rs.nodeIndexLast || 0,
							a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
							b = ind[1];
						if (c) {
							match = !b ? !(c + a) : !((c + a) % b);
						}
						else {
							match = false;
							var brother = rs.parentNode.lastChild;
							do {
								if (brother.nodeType == 1 && (brother.nodeLastIndex = ++c) && rs === brother && (!b ? !(c + a) : !((c + a) % b))) {
									match = true;
								}
							} while (!match && (brother = brother.previousSibling));
						}
					break;
					
					//TODO:: Проверить на производительность универсальную версию и заменить ею, если производительность не сильно падает
					/*case 'nth-child':
					case 'nth-last-child':
						//In this moment "match" MUST be true
						var isLast = css3Mod[1] != 'nth-child',
							ind = css3Mod[2],
							i = isLast ? child.nodeIndexLast : child.nodeIndex || 0,
							a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
							b = ind[1];
						if (i) {//check if we have already looked into siblings, using exando - very bad
							match = !( (i + a) % b);
						}
						else {//in the other case just reverse logic for n and loop siblings
							var brother = isLast ? child.parentNode.lastChild : child.parentNode.firstChild;
							i++;
							do {//looping in rs to find if nth expression is correct
								//nodeIndex expando used from Peppy / Sizzle/ jQuery
								if (brother.nodeType == 1 &&
									isLast ? (brother.nodeLastIndex = i++) : (brother.nodeIndex = ++i) &&
									rs === brother && ((i + a) % b)) {
									match = false;
								}
							} while (match && brother = isLast ? brother.previousSibling : brother.nextSibling);
						}
					breal;*/
					
				/*
				Rrom w3.org: "an E element that has no rsren (including text nodes)".
				Thx to John, from Sizzle, 2008-12-05, line 416
				*/
					case 'empty':
						match = !rs.firstChild;
					break;
				/* W3C: "an E element, only rs of its parent" */
					case 'only-child':
						match = rs.parentNode.getElementsByTagName('*').length == 1;
					break;
				/*
				W3C: "a user interface element E which is checked
				(for instance a radio-button or checkbox)"
				*/
					case 'checked':
						match = !!rs.checked;
					break;
				/*
				W3C: "an element of type E in language "fr"
				(the document language specifies how language is determined)"
				*/
					case 'lang':
						match = (rs.lang == css3Mod[2] || document.documentElement.lang == css3Mod[2]);
					break;
				/* thx to John, from Sizzle, 2008-12-05, line 398 */
					case 'enabled':
						match = !rs.disabled && rs.type !== 'hidden';
					break;
				/* thx to John, from Sizzle, 2008-12-05, line 401 */
					case 'disabled':
						match = !!rs.disabled;
					break;
				/* thx to John, from Sizzle, 2008-12-05, line 407 */
					case 'selected':
				/*
				Accessing this property makes selected-by-default
				options in Safari work properly.
				*/
						//TODO: Проверить новый алгоритм
						//Старый: rs.parentNode.selectedIndex;//NOTE:: Add this string manual to compile by Closure Compiler script/Добавить это строчку в откомпилированый скрипт
						//        match = !!rs.selected;
						match = rs.parentNode.selectedIndex && !!rs.selected;//Тут уже Closure Compiler не удаляет нужный вызов
				    break;
					
					default:
						//Non-standart pseudo-classes
						var f = $$N.nonStandartPseudoClasses[css3Mod[1]];
						if(f)match = f(rs);
				}
				
			}
			if(!match)result.splice(--i, 1);
		}
	}

	return result;
}
/** @type {string} создания уникального идентификатора (HTMLElement.id) */
$$N.str_for_id = "r" + randomString(6);
/** @type {number} Инкреминтируемое поле для создания уникального идентификатора. Используется вместе с $$N.str_for_id */
$$N.uid_for_id = 0;
$$N.getElementsByClassName1 = document.getElementsByClassName ?
		function (className, tag, root, returnElements) {
			var elements = root.getElementsByClassName(className),//typeof elements == 'NodeList'
				nodeName = (tag && tag != "*") ? new RegExp("\\b" + tag + "\\b", "i") : null,
				current, i = 0;
			if(!nodeName) while(current = elements[i++])
				returnElements.push(current);
			else while(current = elements[i++])
				if(nodeName.test(current.nodeName))
					returnElements.push(current);
		} : function (className, tag, root, returnElements) {
			tag = tag || "*";

			var elements = (tag === "*" && root.all) ? root.all : root.getElementsByTagName(tag),
				current,
				match, k, l = 0, curClName;

			while (current = elements[l++]) {
				match = true;
				k = -1;
				curClName = ' ' + current.className + ' ';
				while(className[++k] && match) {
					match = ~curClName.indexOf(className[k]);
				}
				if(match)returnElements.push(current);
			}
		}
if(document.getElementsByClassName)$$N.getElementsByClassName1.analisClasses = function(className) {
	return className.replace(/\./g, " ");
}
else $$N.getElementsByClassName1.analisClasses = function(className) {
	return (" " + className.slice(1).replace(/\./g, " | ") + " ").split("|");
}
$$N.nonStandartPseudoClasses = {
	//Found elements what HAS a child 
	"parent" : function(child) {
		return !!child.firstChild;
	},
	"text-only" : function(child) {
		var result = true, node, i = -1;
		while(node = child.childNodes[++i] && result)result = node.nodeType == 3;
		return result;
	},
	//:(parent|<adding here all new>)
	regExp : /:(parent|text-only)$/
	//regExp = /:(parent|text-only)(?:([ >~+])|$)/;//Конец регулярного выражения "(?:([ >~+])|$)/;" - должен оставатся неизменным
        
}

/**
 * Получение эллементов по классам и тэгам
 * HINT: Пользоватся такой функцией можно только после загрузки страницы (addLoadEvent)
 * @param {!string} selector Строка с CSS3-селектором
 * @param {Document|HTMLElement|Node|Array.<HTMLElement>=} roots Список элементов в которых мы будем искать
 * @param {boolean=} isFirst ищем только первый
 * @return {Array.<HTMLElement>} Список найденных элементов
 * @version 3.0
 *  changeLog: 3.0 [06.05.2011 15:47] [*bug] Исправил баг, когда поиск элементов продолжался, даже тогда, когда предыдущая выборка не дала результата
 *			   2.8 [23.02.2011 21:50] <bugfix> Не передавался isFirst в $$N
 *  		   2.7:(*)Функция разделена на две: $$N - выбор по одному селектору и $$ - выбор по нескольким селекторам разделённым запятой
 *  		   2.6:(+)Теперь можно использовать "*" на месте tagName
 *  		   2.5:(!)Исправлена ошибка с множественным селектором, при котором правило идущее за "," (запятой) не выполнялось 
 *  		   2.4:(!)Исправлена ошибка как в 2.1. (+)Теперь селектор можно начинать с модификатора (>,~,+)
 *  		   2.2:(!)Исправлена ошибка в модификаторах '~' и '+'
 *  		   2.1:(!)Исправлена ошибка при которой не находились элементы во втором селекторе, если в первом ничего не найдено ["tag1>.class2, tag2>.class2"]
 */
function $$(selector, roots/*, noCache*/, isFirst) {
	/*if(d.querySelectorAll) {
		//TODO: Вызывать querySelectorAll, если он есть
		roots = !roots ? [d.body] : (Array.isArray(roots) ? roots : [roots]);
		// проверяем неподдерживаемые браузерами селекторы
		var root, k = -1, result = [];
		while(root = roots[++k])result.concat($$0(selector, root))
	}*/
	
	//var rules = selector.replace(/ *([,>+~. ]) */g, "$1").match(/[^,]\w*/g),
	var rules = (selector + ",").replace(/ *([,>+~ ]) */g, "$1").replace(/\((\dn)\+(\d)\)/, "\($1%$2\)").match(/(^[+> ~]?|,|\>|\+|~| ).*?(?=[,>+~ ]|$)/g),
		i = 0,
		rule,
		selElements = [],
		//TODO:: flei = 0;//firstLastElementIndex - индекс первого элемента из последних добавленных элементов (перед ',')
		result = [],
		hightRoots = roots;
		
	while((rule = rules[i++])) {
		if(rule.charAt(0) == ',') {//Если первая буква серектора - запятая
			if(selElements && selElements.length > 0)result = result.concat(selElements);
			selElements = [];
			roots = hightRoots;
			if(rule.length == 1)continue;//Если правило - это только запятая
		}
		else if(selElements && selElements.length > 0)	{
			roots = selElements;
		}
		if(selElements)selElements = $$N(rule, roots, isFirst);
		if(selElements && !selElements.length)selElements = null;
		//Если selElements == null и не равно "," - значит мы ничего не нашли на пред. шаге
	}
	
	return result;
}

/**
 * @param {!string} selector
 * @param {Document|HTMLElement|Node=} root
 * @return {HTMLElement|Node}
 * @version 4.1
 */
function $$0(selector, root) {	
	return $$(selector, root, true)[0];
}

/**
 * getCurrentStyle - функция возвращяет текущий стиль элемента
 * @param {HTMLElement} obj HTML-Элемент
 * @return {CSSStyleDeclaration} Стиль элемента
 */
var getCurrentStyle = window.getComputedStyle ?
	function(obj) {	return window.getComputedStyle(obj, null) } :
    function(obj) { return obj.currentStyle }


/** Example of making a document HTML5 element safe
 * Функция "включает" в IE < 9 HTML5 элементы
 * Используется, если никакая другая аналогичная функция не используется
 */
function html5_document(doc) { // pass in a document as an argument
	// create an array of elements IE does not support
	var html5_elements_array = 'abbr article aside audio canvas command datalist details figure figcaption footer header hgroup keygen mark meter nav output progress section source summary time video'.split(' '),
	a = -1;

	while (++a < html5_elements_array.length) { // loop through array
		doc.createElement(html5_elements_array[a]); // pass html5 element into createElement method on document
	}

	return doc; // return document, great for safeDocumentFragment = html5_document(document.createDocumentFragment());
} // critique: array could exist outside the function for improved performance?


//Исправляем для IE<9 создание DocumentFragment, для того, чтобы функция работала с HTML5
if(browser.msie < 9) {
	var msie_CreateDocumentFragment = function() {
		return html5_document(msie_CreateDocumentFragment.orig.call(d));
	}
	msie_CreateDocumentFragment.orig = d.createDocumentFragment;
	
	d.createDocumentFragment = msie_CreateDocumentFragment;
}


/**
 * Issue: <HTML5_elements> become <:HTML5_elements> when element is cloneNode'd
 * Solution: use an alternate cloneNode function, the default is broken and should not be used in IE anyway (for example: it should not clone events)
 * В Internet Explorer'е функция <HTMLElement>.cloneNode "ломает" теги HTML5 при клонировании,
 *  поэтому нужно использовать альтернативный способ клонирования
 *
 * Больше по теме: http://pastie.org/935834
 *
 * Функция клонирует DOM-элемент
 * Альтернатива <Node>.cloneNode в IE < 9. В остальных браузерах просто вызывается <Node>.cloneNode
 * Дополнительно, функция удаляет id у вновь склонированного элемента, если delete_id != false
 * @param {Node|Element} element Элемент для клонирования
 * @param {boolean} include_all Клонировать ли все дочерние элементы? По-умолчанию, true
 * @param {boolean} delete_id Удалить аттрибут id из нового элемента? По-умолчанию, true
 * @version 2
 *  chacgeLog: 2 [06.07.2011 20:00] Добавил поддержку клонирования td и tr для IE < 9
 *			   1 [--.--.2011 --:--] Initial release
 */
function cloneElement(element, include_all, delete_id) {
	if(typeof include_all == undefType)include_all = true;
	if(typeof delete_id == undefType)delete_id = true;
	
	var result;
	
	//Следующий вариант не работает с HTML5
	//if(cloneElement.safeDocumentFragment) {
		//result = cloneElement.safeDocumentFragment.appendChild(document.createElement("div"));//Создаём новый элемент
		
	if(cloneElement.safeElement) {//Мы присваеваем cloneElement.safeDocumentFragment только если браузер - IE < 9
		cloneElement.safeElement.innerHTML = "";//Очистим от предыдущих элементов
		
		
		if(include_all && /td|tr/gi.test(element.tagName)) {//Только для элементов td и tr
			//Хак для IE < 9, для нормального копирования ячеек таблицы
			if(element.tagName.toUpperCase() == "TR") {
				cloneElement.safeElement.innerHTML = "<table><tbody>" + element.outerHTML + "</tbody></table>";
				result = cloneElement.safeElement.firstChild.firstChild.firstChild;
			}
			else if(element.tagName.toUpperCase() == "TD") {
				cloneElement.safeElement.innerHTML = "<table><tbody><tr>" + element.outerHTML + "</tr></tbody></table>";
				result = cloneElement.safeElement.firstChild.firstChild.firstChild.firstChild;
			}
		}		
		else {
			if(include_all)cloneElement.safeElement.innerHTML = element.outerHTML; // set HTML5-safe element's innerHTML as input element's outerHTML
			else cloneElement.safeElement.innerHTML = element.outerHTML.replace(element.innerHTML, "");
		
			result = cloneElement.safeElement.firstChild; // return HTML5-safe element's first child, which is an outerHTML clone of the input element
		}
	}
	else result = element.cloneNode(include_all);
	
	if(delete_id && result.id)result.id = "";
	
	return result;
}
//Создаём DOM-элемент для безопастного копирования HTML5 DOM-элементов
cloneElement.safeElement = 
	(browser.msie < 9) ? html5_document(d.createDocumentFragment()).appendChild(document.createElement("div"))
//cloneElement.safeDocumentFragment = 
//	(browser["msie"] && browser.msieV < 9) ? html5_document(d.createDocumentFragment())// saves a new shim'd document fragment
	:
	null; 
	
/**
 * Функция возвращяет первый вложеный в node DOM-элемент
 * @param {Element} node
 */
var firstElement = browser.traversal ? function(node) {
    // для новых браузеров достаточно
    // воспользоваться встроенным методом
    return node.firstElementChild;
} : function(node) {
    // для старых браузеров
    // находим первый дочерний узел
    node = node.firstChild;
    // ищем в цикле следующий узел,
    // пока не встретим элемент с nodeType == 1
    while(node && node.nodeType != 1) node = node.nextSibling;
    // возвращаем результат
    return node;
};

/**
 * Функция возвращяет последний вложеный в node DOM-элемент
 * @param {Element} node
 */
var lastElement = browser.traversal ? function(node) {
    return node.lastElementChild;
} : function(node) {
    node = node.lastChild;
    while(node && node.nodeType != 1) node = node.previousSibling;
    return node;
};

/**
 * Функция возвращяет следующий за node DOM-элемент
 * @param {Element} node
 */
var nextElement = browser.traversal ? function(node) {
    return node.nextElementSibling;
} : function(node) {
    while(node = node.nextSibling) if(node.nodeType == 1) break;
    return node;
};

/**
 * Функция возвращяет предыдущий к node DOM-элемент
 * @param {Element} node
 */
var previousElement = browser.traversal ? function(node) {
    return node.previousElementSibling;
} : function(node) {
    while(node = node.previousSibling) if(node.nodeType == 1) break;
    return node;
};

/**
 * Вставляет DOM-элемент вслед за определённым DOM-элементом
 * @param {Node} node Куда вставляем
 * @param {Node} newNode Что вставляем
 * @param {Node} refNode После чего вставляем
 * @return {Node} Переданый newNode
 */
function insertAfter(node, newNode, refNode) {
	return node.insertBefore(newNode, refNode.nextSibling);
};


/**
 * TODO:: Описать
 * Нету функции is(selector), нету и фильтрации по селектору
 */
function getTextNodes(root/*, _filter*/) {
	var result = [],
		skip = {"SCRIPT":1, "NOSCRIPT":1, "STYLE":1, "IFRAME":1},
		//notType = typeof _filter,
		filter = null;/*notType === "string" ? function(node){ return !$(node).is(_filter); } :
				 notType === "function" ? _filter :  //e.g. function(node){ return node.nodeName != 'A'; }
				 null;*/
	
	function recurse(root) {
		var i = -1, children = root.childNodes, node;
		while(node = children[++i]) {
			if(node.nodeType == 3 && /\S/.test(node.nodeValue))result.push(node);
			else if(node.nodeType == 1 &&
					!skip[ node.nodeName.toUpperCase() ] && 
					(!filter || filter(node)))
				recurse(node);
		}
	}
	if(!Array.isArray(root))root = 
		root.length ? $A(root)//Если root объект типа NodeList
		: [root];
	root.forEach(recurse);

	return result;
}

/*function getChildCount(container) {
	if('childElementCount' in container)return container.childElementCount;
	
	if(container.children)return container.children.length;
	
	// Firefox before version 3.5
	var child = container.firstChild,
		childCount = 0;
		
	while(child) {
		if(child.nodeType == 1)childCount++;
		child = child.nextSibling;
	}
	
	return childCount;
}*/
/*  ======================================================================================  */
/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  DOM  =======================================  */

/*  =======================================================================================  */
/*  ========================================  DEBUG  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */

// Делаем консоль более "дружелюбной" http://habrahabr.ru/blogs/javascript/116852/
// + Мой [Egor] грязный хак для IE
if(DEBUG)(function () {
	var global = this,
		original = global.console,
		console = global.console = {},
	// список методов
		methods = ['assert', 'count', 'debug', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed',
				   'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'trace', 'warn'],
		isMudak = !original.log.apply;//Определяем ie 8,9
		
	if (original && !original.time ||
		browser.opera//console.time и console.timeEnd "глючат" немного в Opera Dragonefly
		) {
		original.time = function(name, reset){
			if(!name)return;
			if(!console.timeCounters)console.timeCounters = {};

			var key = "KEY" + name.toString();
			if(!reset && console.timeCounters[key])return;
			console.timeCounters[key] = new Date().getTime();
		};

		original.timeEnd = function(name){
			if(!name || !console.timeCounters)return;
			
			var key  = "KEY" + name.toString(),
				timeCounter = console.timeCounters[key],
				diff;

			if(timeCounter) {
				diff = new Date().getTime() - timeCounter;
				console.info(name + ": " + diff + "ms");
				delete console.timeCounters[key];
			}
		};
	}
		
	// обход всех элементов массива
	while(methods.length) {
		// обратите внимание, что обязательно необходима анонимная функция,
		// иначе любой метод нашей консоли всегда будет вызывать метод 'assert'
		(function (methodName) {
			// определяем новый метод
			console[methodName] = function () {
				// только если консоль доступна и есть нужный метод
				if (original && methodName in original) {
					// вызываем оригинальный метод консоли
					if(!isMudak) {
						original[methodName].apply(original, arguments);
					}
					else {//Грязный хак для IE
						var add = "";
						//Заодно, добавим разделители в вывод функций log, error, info и warn, когда им передаются много параметров
						if(methodName in {"log":1, "error":1, "info":1, "warn":1} &&
						   !!arguments[0] && !/%[sdif]/.test(arguments[0])//Только, если мы не используем форматированный вывод
							)add = ",', '";
						var args = arguments.length ? "(arguments[" + $K(arguments).join("]" + add + ",arguments[") + "])" : "";
						eval("original." + methodName + args);
					}
				}
			};
		})(methods.pop());
	}
})();

/**
 * @namespace Логирование
 */
var Log = DEBUG ? (function() {
/* PRIVATE */
	var thisObj = {},
		_c = console,
		_countContainer = {},
		_groups = [];

/* PUBLICK */
	thisObj.start = function() {
		var name = arguments[0] || randomString(6);
		_c.time(name);
		thisObj.group(name + " START ");
		_groups.push(name);
		thisObj.log.apply(thisObj, $A(arguments, 1));
	}
	thisObj.end = function() {
		thisObj.log.apply(thisObj, $A(arguments));
		var name = _groups.pop();
		_c.timeEnd(name);
		thisObj.log(name + " END " + repeatString("-", _groups.length + 1));
		thisObj.groupEnd();
	}
	thisObj.log = function(var_args) {
		_c.log.apply(_c, arguments);
	}
	thisObj.logsFirst = function(count, uniqueName) {
		if(_countContainer[uniqueName] === void 0)_countContainer[uniqueName] = count;
		else _countContainer[uniqueName]--;
		if(_countContainer[uniqueName])thisObj.log.apply(thisObj, $A(arguments, 2));
	}
	thisObj.err = function() {
		_c.error.apply(_c, arguments);
	}
	thisObj.errsFirst = function(count, uniqueName) {
		if(!_countContainer[uniqueName])_countContainer[uniqueName] = count;
		else _countContainer[uniqueName]--;
		if(_countContainer[uniqueName])thisObj.err.apply(thisObj, $A(arguments, 2));
	}
	
	thisObj.group = _c.group ? _c.group.bind(_c) : thisObj.log;//For IE
	thisObj.groupEnd = _c.groupEnd ? _c.groupEnd.bind(_c) : function(){};//For IE
	
	thisObj.assert = _c.assert ? _c.assert.bind(_c) : function(expression, falseMessage) {
		var isTrue;
		if(typeof expression == "function")isTrue = expression();
		else isTrue = !!expression;
		
		if(!isTrue)thisObj.error(falseMessage);
	}
   	
	/**
	 * @param {HTMLElement|Node} el
	 * @param {boolean=} addParentName Добавлять родительское имя?
	 */
	thisObj.name = function(el, addParentName) {
		return  el ? ((addParentName && el.parentNode && (thisObj.name(el.parentNode) + "->") || "") + 
			el.tagName + (el.id ? "#" + el.id : "") + (el.className ? "." + el.className.replace(/ /g, ".") : ""))
				  : "";
	}
	
	thisObj.dump = function(obje, obj_name, prefix, postfix/*, maxLvl*/) {
		if(prefix === void 0)prefix = "";
		if(postfix === void 0)postfix = "";
		
		//if(maxLvl > 9)maxLvl = 9;
		
		var result = (obj_name || "") + ":";
		var hop = Object.prototype.hasOwnProperty;
	
		for(var i in obje) if(hop.call(obj, i)) {
			/*if(typeof obje[i] == "object" && maxLvl)result += prefix + dump(obje[i], i, prefix, postfix, --maxLvl) + postfix
			else */result += prefix + i + "=" + obje[i] + postfix;
		}
		return result;
	} 
	
	return thisObj;
})() : null;

/*  ======================================================================================  */
/*  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  DEBUG  =====================================  */

/* end ФУНКЦИИ ДЛЯ РАБОТЫ */

/*  ======================================================================================  */
/*  ======================================================================================  */
/*  ======================================================================================  */
/*  ===================================  Функции сайта  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  */
/*  ======================================================================================  */

/**
 * @namespace объект со специфическими свойствами магазина
 */
var Site = {
	/* Константы */
	/** Исходный заголовок страницы
	 * @const 
	 * @type {string} */
	title : d.title,
	/** @const 
	 * @type {string} */
	path : location.protocol + "//" + location.host + location.pathname,
	/* Переменные */

	inits : [],
	afterLoads : [],
	
	/* Функции */
	afterPageLoad : function() {
		if(browser.noDocumentReadyState)document.readyState = "complete";
		
		for(i in Site.afterLoads)if(Site.afterLoads.hasOwnProperty(i) && typeof (i = Site.afterLoads[i]) == "function")i();		
	},
	
	/**
	 * Инициализация сайта
	 */
	init : function() {
		if(browser.noDocumentReadyState)document.readyState = "interactive";
		
		//Добавим к тегу <HTML> класс с названием браузера/движка
		d.documentElement.className += (" " + browser.names.join(" "));
		
		for(i in Site.inits)if(Site.inits.hasOwnProperty(i) && typeof (i = Site.inits[i]) == "function")i();
	}
}

/***----------------- СТАРТ ------------------***/

Events.add(window, 'DOMReady', Site.init);
Events.add(window, 'load', Site.afterPageLoad);