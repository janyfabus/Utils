/*
 * G(selector) - vyhladá elementy podla selectora a vráti G object
 * G(nazov, {attr:{}, "obsah elementu", style:{}}) - vytvorý nový G object
 * G(nazov, {attr:{}, element, style:{}}) - vytvorý nový G object
 *
 * @param args - argumenty funkcie
 * @constructor
 */


G = function(... args){//TODO otestovať
	if(args.length === 0)
		this.elements = [];
	else if(args.length === 1){
		if(G.isString(args[0]))
			this.elements = G.find(args[0]);
		else if(G.isArray(args[0]))
			this.elements = args[0];
		else if(G.isElement(args[0]))
			this.elements = [args[0]];
		else if(G.isObject(args[0]) && G.isArray(args[0].elements))
			this.elements = args[0].elements;
	}
	else if(args.length === 2 && G.isString(args[0]) && G.isObject(args[1])){
		this.elements = [G.createElement(args[0], args[1].attr, args[1]["cont"], args[1]["style"])]
	}

	if(G.isUndefined(this.elements)){
		G.error("nepodarilo sa rozpoznať argumenty: ", args);
		this.elements = [];
	}

	this.size = this.elements.length;
};

function tests(){
	body = new G(document.body);
	/*
	 * empty();
	 * append();
	 * length();
	 * createElement();
	 */
	body.empty();
	if(body.children().length() !== 0)
		G.error("dlžka prazdneho objektu je: " + body.length());

	body.append("<div id='idecko'>jupilajda</div>");
	body.append(new G("div", {
		attr : {
			class: "clasa"},
		cont: "toto je classsa"
	}));
	var elementP = document.createElement("p");
	elementP.appendChild(document.createTextNode("juhuuu toto je paragraf"));
	body.append(elementP);
	if(body.children().length() !== 3)
		G.error("dlžka objektu s 2 detmi je: " + body.children().length());

	var idecko = new G("#idecko");
	var clasa = new G(".clasa");
	var par = new G("p");

	/* 
	 * constructor()
	 * find()
	 * first();
	 */

	if(G.isDefined(new G().first()))
		G.error("pri prazdnom G to nevratilo ako prvý element null")

	if(idecko.first() !== document.getElementById("idecko"))
		G.error("nenašlo to spravny element podla id");

	if(clasa.first() !== document.getElementsByClassName("clasa")[0])
		G.error("nenašlo to spravny element podla class");

	if(par.first() !== document.getElementsByTagName("p")[0])
		G.error("nenašlo to spravny element podla tagu");
	
	/*
	 * css
	 */

	if(!G.isObject(idecko.css()))
		G.error("css() nevratilo objekt");

	idecko.css("color", "");
	if(idecko.css("color") !== "")
		G.error("nenastavený css nieje prazdny");

	idecko.css("color", "red");
	if(idecko.css("color") !== "red")
		G.error("nesprávne to nastavilo css štýl");

	idecko.css({color: "blue", width: "200px"});

	if(idecko.css("color") !== "blue" || idecko.css("width") !== "200px")
		G.error("nesprávne to nastavilo css štýl s objektu");

	if(idecko.parent().first() !== body.first())
		G.error("parent nefunguje správne");

}

/*************************************************************************************
 UTILITOVE FUNKCIE
 *************************************************************************************/

G.error = function(... msg){
	console.error.apply(this, msg);
}

/**
 * Funkcia vytvorý nový element a vráty ho
 *
 * G.createElement("div") => <div></div>;
 * G.createElement("div", {id: "ide"}) => <div id="ide"></div>;
 * G.createElement("div", {}, "text") => <div>text</div>;
 * G.createElement("div", {}, "<b>text</b>") => <div><b>text</b></div>;
 * G.createElement("div", {}, "text", {color: "blue"}) => <div style="color: blue;">text</div>
 *
 * @param name - názov elementu
 * @param attr
 * @param cont - objekt kde kluče su nazvy atribútov a hodnoty su hodnoty atribútov
 * @param style - objekt kde kluče su nazvy štýlov a hodnoty su hodnoty štýlov
 * @returns {Element} - novo vytvorený element
 */
G.createElement = function(name, attr, cont, style){
	var i;
	if(G.isObject(name)){
		if(G.isDefined(name.name)&& G.isDefined(name.attr) && G.isDefined(name["cont"]) && G.isDefined(name["style"]))
			return G.createElement(name.name, name.attr, name["cont"], name["style"]);
		else
			return G.error("zle zadane parametre");
	}
	if(G.isString(name))
		var el = document.createElement(name);
	else
		return G.error("prvý parameter(nazov elementu) musí byť string");

	if(G.isObject(attr))
		for(i in attr)
			if(attr.hasOwnProperty(i))
				el.setAttribute(i, attr[i]);

	if(G.isObject(style))
		for(i in style)
			if(style.hasOwnProperty(i))
				el.style[i] = style[i];

	if(G.isString(cont))
		el.innerHTML = cont;
	else if(G.isArray(cont)){
		for(i in cont)
			if(cont.hasOwnProperty(i) && G.isObject(cont[i]))
				el.appendChild(cont[i]);
	}
	else if(G.isObject(cont))
		el.appendChild(cont);

	return el;
};

G.isDefined = (val) => typeof val !== "undefined";
G.isFunction = val => typeof val === "function";
G.isString = val => typeof val === "string";
G.isObject = val => typeof val === "object";
G.isNumber = val => typeof val === "number";
G.isBool = val => typeof val === "boolean";
G.isUndefined = val => !G.isDefined(val);
G.isG = val => val.__proto__ === G.prototype;
G.isArray = val => Array.isArray(val);
G.isToStringable = val => G.isNumber(val) || G.isString(val) || G.isBool(val);
G.isGElement = val => val["isGElement"] === true;
G.isElement = obj => {
	try {return obj instanceof HTMLElement;}
	catch(e){return G.isObject(obj) && obj.nodeType === 1 && G.isObject(obj.style) && G.isObject(obj.ownerDocument);}
};

/**
 * Funkcia zlúči objekty na vstupe do jedného (prvého) objektu
 *
 * G.extend({a: "aa", b: "bb"}, {c: "cc", a: "aaa"}, {c: "ccc"}) => Object {a: "aaa", b: "bb", c: "ccc"}
 */
G.extend = function(target, ... args){//TODO otestovať
	if(G.isObject(target)){
		for(var i=0; i<args.length; i++)
			if(G.isObject(args[i])){
				for(var key in args[i])
					if(args[i].hasOwnProperty(key))
						target[key] = args[i][key];
			}
			else
				G.error("args[" + i + "] ma byť object a je : " + args[i]);
	}
	else
		G.error("prvý argument musí byť objekt. teraz je: " + target)
	return target;
};

/**
 * Funkcia preloopuje pole alebo objekt daný ako argument a zavolá funkciu a umožnuje nastaviť lubovolný this objekt
 *
 * @param obj - objekt ktorý sa má preloopovať
 * @param func - funkcia ktorá sa má zavoláť pre každý objekt a jej parametre su: (element, index, pole)
 * @param thisArg - objekt ktorý má byť dosadený sa this premennú
 */
G.each = function(obj, func, thisArg){
	var i;
	if(G.isObject(obj) && G.isFunction(func)){
		if(G.isArray(obj)){
			if(G.isObject(thisArg))
				for(i = 0; i<obj.length ; i++)
					func.call(thisArg, obj[i], i, obj);
			else
				for(i = 0; i<obj.length ; i++)
					func(obj[i], i, obj);
		}
		else{
			if(G.isObject(thisArg)){
				for(i in obj)
					if(obj.hasOwnProperty(i))
						func.call(thisArg, obj[i], i, obj);
			}
			else
				for(i in obj)
					if(obj.hasOwnProperty(i))
						func(obj[i], i, obj);
		}
	}
	else
		G.error("argumenty majú byť (object, function) a sú:", obj, func);
};


/**
 * Funkcia najde v rodičovnskom objekde objekty ktoré najde CSS selector
 *
 * @param key - klúč podla ktorého sa má hladať
 * @param parent - element v ktorom sa má hladadť. Defaultne je do document
 * @returns {Array} - pole nájdených výsledkov
 */
G.find = function(key, parent){//TODO otestovať
	var result = [];

	if(!G.isElement(parent))
		parent = document;

	if(G.isString(key)){
		var data = parent.querySelectorAll(key);
		for(var i in data)
			if(data.hasOwnProperty(i))
				result.push(data[i]);
	}
	else 
		G.error("argument funkcie musí byť string a je ", key);

	return result;
};

/**
 * Funkcia vráti rodičovský element elementu na vstupe alebo null
 *
 * @param element - element ktorému sa hladá rodičovský element
 * @returns {null} - rodičovský element alebo null ak sa nenašiel rodič
 */
G.parent = function(element){
	if(G.isElement(element))
		return element.parentElement;

	G.error("argument funcie musí byť element a teraz je: ", element);
	return null;
};

G.next = function (element){
	if(G.isElement(element))
		return element.nextSibling;

	G.error("argument funcie musí byť element a teraz je: ", element);
	return null;
};

G.prev = function (element){
	if(G.isElement(element))
		return element.previousSibling;

	G.error("argument funcie musí byť element a teraz je: ", element);
	return null;
};

G.children = function(element){//TODO prerobiť
	var result = [];
	if(G.isElement(element)){
		var data = element.children;
		for(var i in data)
			if(data.hasOwnProperty(i) && result.indexOf(data[i]) < 0)
				result.push(data[i]);
	}
	else
		G.error("argument funcie musí byť element a teraz je: ", element);
	return result;
};

/**
 * Funkcia vymaže element na vstupe
 *
 * @param element - element ktorý sa má vymazať
 */
G.delete = function(element){
	if(G.isElement(element))
		element.parentElement.removeChild(element);
	else
		G.error("argument funcie musí byť element a teraz je: ", element);
};

/*************************************************************************************
 PROTOTYPOVO-UTILITOVE FUNKCIE
 *************************************************************************************/
/**
 * Funkcia pridá do objektu elementy ktoré sú na vstupe alebo string pre vyhladanie
 *
 * @param args - objekty ktoré sa majú pridať
 * @returns {G} - G objekt
 */

G.prototype.add = function(... args){
	for(var i in args)
		if(args.hasOwnProperty(i)){
			if(G.isElement(args[i]))
				this.element.push(args[i]);
			else if(G.isString(args[i]))
				this.elements.push.apply(this, G.find(args[i]));
			else
				G.error("argumenty funkcie: (... string), " + i +"-ty argument: " + (typeof args[i]));
		}
	return this;
};

//equalAll

G.prototype.equal = function(element){
	if(G.isG(element))
		return this.first() === element.first();
	else if(G.isElement(element))
		return this.first() === element;
	else
		G.error("argument funkcie môže byť iba element alebo G objekt");
	return false;
}

G.prototype.contains = function(element){//TODO otestovať
	if(G.isElement){
		for(var i=0 ; i<this.element.length ; i++)
			if(this.element[i] === element)
				return true;
	}
	else
		G.error("argument funkcie musí byť element a teraz je: ", element);

	return false;
}

/**
 * Funkcia vyprázdni element a vráti hod
 *
 * @returns {G} - G objekt
 */
G.prototype.empty = function(){
	return this.html("");
};

G.prototype.clear = function(){
	this.elements = [];
	return this;
}

G.prototype.hasClass = function(className){
	return this.class(className);
};

G.prototype.val = function(){
	return this.attr("value", arguments[0]);
};

G.prototype.addClass = function(className){
	return this.class("+" + className);
};

G.prototype.removeClass = function(className){
	return this.class("-" + className);
};

G.prototype.toggleClass = function(className){
	return this.class("/" + className);
};

/*************************************************************************************
 TRAVERSINGOVE FUNKCIE
 *************************************************************************************/


/**
 * Funkcia vráti G objekt obsahujuci rodiča daného elementu
 */
G.prototype.parent = function(){
	return new G(G.parent(this.first()));
};

G.prototype.next = function(){
	return new G(G.next(this.first()));
};

G.prototype.prev = function(){
	return new G(G.prev(this.first()));
};

G.prototype.children = function(){//TODO otestovať - pridať možnosť filtrovať deti
	return new G(G.children(this.first()));
};

G.prototype.each = function(func, ... args){//TODO otestovať asi prerobiť lebo neviem či bude takto použitelne (args)
	if(G.isFunction(func)){
		for(var i in this.elements)
			if(this.elements.hasOwnProperty(i))
				func.apply(this.elements[i], args);
	}
	else
		G.error("prvý parameter musí byť funkcia a je: ", func);

	return this;
};

/*************************************************************************************
 NEZARADENE FUNKCIE
 *************************************************************************************/

G.prototype.first = function(){
	return this.elements[0];
};

G.prototype.length = function(){
	return this.elements.length;
};

G.prototype.isEmpty = function(){
	return this.length() === 0;
};

/*************************************************************************************
 HTML/CSS FUNKCIE
 *************************************************************************************/

G.prototype.prependTo = function(data){//TODO otestovať
	if(this.isEmpty())
		return this;

	if(G.isElement(data))
		data.parentElement.insertBefore(this.first(), data.parentElement.firstElementChild);
	else
		G.error("argument funkcie musí byť element a je: ", data);
	return this;
};

G.prototype.appendTo = function(data){//TODO otestovať
	if(this.isEmpty())
		return this;

	if(G.isElement(data))
		data.appendChild(this.first());
	else
		G.error("argument funkcie musí byť element a je: ", data);

	return this;
};

G.prototype.prepend = function(data){//TODO otestovať
	if(this.isEmpty())
		return this;

	if(G.isElement(data))
		this.first().insertBefore(data, this.first().firstElementChild);
	else if(typeof data === "string")
		this.html(data + this.html());
	else
		G.error("argument funkcie musí byť element alebo string a teraz je: ", data);
	return this;
};

G.prototype.append = function(data){//TODO otestovať
	if(this.isEmpty())
		return this;
	if(G.isElement(data))
		this.first().appendChild(data);
	else if(typeof data === "string"){
		this.first().innerHTML += data;
	}
	else if(G.isG(data) && !data.isEmpty())
		this.first().appendChild(data.first());
	else
		G.error("argument funkcie musí byť element alebo string a teraz je: ", data);

	return this;
};

/**
 * text() - vráti obsah ako text
 * text("juhuuu") - text elementu bude "juchuuu"
 * text("<b>ju</b><p>huuu</p>") - text elementu bude "juhuuu"
 */
G.prototype.text = function(text){//TODO otestovať
	if(this.isEmpty())
		return this;

	if(G.isString(text))
		return this.html(text.replace(/<[^>]*>/g, ""));
	else if(G.isDefined(text))
		G.error("argument funkcie musí byť text a teraz je: ", text);

	return this.first().textContent;
};

/*
 * html() - vráti HTML obsah elementu
 * html("<b>bold</b>") - nastavý HTML obsah elementu
 * html("Element") - nastavý ako jedine dieťa nový element
 */
G.prototype.html = function(html){
	if(this.isEmpty())
		return this;

	if(G.isUndefined(html))
		return this.first().innerHTML;
	if(G.isString(html)){
		if(html[0] === "+")
			this.append(html.substring(1));
		else
			this.first().innerHTML = html;
	}
	else if(G.isElement(html)){//TODO otestovať
		this.first().innerHTML = "";
		this.append(html);
	}
	//TODO ak je G tak pridá všetky elementy čo obsahuje argument G
	return this;
};

/**
 * Funkcia vymaže prvý element v zozname a vráti G object
 */
G.prototype.delete = function(){//TODO otestovať - pridať možnosť filtrovať vymazane
	if(this.isEmpty())
		return this;

	G.delete(this.first());
	if(G.isArray(this.elements))
		this.elements.splice(0, 1);
	else if(G.isObject(this.elements))
		delete this.first();

	return this;
};

/**
 * class("nazov") - vrati true ak ma objekt danú triedu ináč vrát false
 * class("+nazov") - pridá objektu danú triedu
 * class("-nazov") - odstráni objektu danú triedu
 * class("/nazov") - pridá objektu danú triedu ak neexistuje ináč ju odstráni
 */
G.prototype.class = function(name){//TODO prerobiť - nemôže vracať this ak ma vratit T/F
	if(this.isEmpty())
		return this;
	var classes = this.first().classList;
	if(G.isArray(name))
		G.each(name, (e) => this.class(e));
	else if(G.isString(name)){
		switch(name[0]){
			case "+":
				classes.add(name.substring(1));
				break;
			case "-":
				classes.remove(name.substring(1));
				break;
			case "/":
				name = name.substring(1);
				this.attr("class").indexOf(name) > -1 ? classes.remove(name) : classes.add(name);
				break;
			default:
				return this.attr("class").indexOf(name) > -1;
		}
	}
	return this;
};


/**
 * css() - vráti všetky nastavené CSS štýly;
 * css("nazov") - vráti hodnotu CSS štýlu;
 * css("-nazov") - vymaža daný CSS štýl;
 * css("nazov", "hodnota") - nastavý danému CSS štýlu hodnotu;
 * css({"nazov1": "hodnota1", "nazov2" : "hodnota2"}) - nastavý všétkým CSS štýlom hodnoty;
 */
G.prototype.css = function(...args){
	if(this.isEmpty())
		return this;
	var i;
	//ak je 0 argumentov vráti objekt z CSS štýlmi
	if(args.length == 0){
		var result = {};
		var css = window.getComputedStyle(this.first());
		for(i in css)
			if(css.hasOwnProperty(i) && css.getPropertyValue(css[i]) !== "")
				result[css[i]] = css.getPropertyValue(css[i]);
		return result;
	}

	//ak je prvý argument string
	if(G.isString(args[0])){
		//a druhý argument je zadaný a dá sa prepísať na string nastav štýl
		if(args.length == 2 && G.isToStringable(args[1])){
			this.first().style[args[0]] = args[1];
		}
		//ak prvý argument neobsahuje symbol pre vymazanie tak vráť hodnotu štýlu
		else if(args[0][0] !== "-"){
			return this.first().style[args[0]];
		}
		//ináč štýl odstráň
		else{
			this.first().style[args[0].substring(1)] = "";
		}
	}
	//ak je prvý argument objekt nastav všetky štýli podla objektu
	else if(G.isObject(args[0]))
		for(i in args[0])
			if(args[0].hasOwnProperty(i) && G.isString(i) && G.isToStringable(args[0][i]))
				this.first().style[i] = args[0][i];
	return this;
};


/**
 * attr() - vráti všetky atribúty;
 * attr("nazov") - vráti hodnotu atribútu;
 * attr("-nazov") - vymaža daný atribút;
 * attr("nazov", "hodnota") - nastavý danému atribútu hodnotu;
 * attr({"nazov1": "hodnota1", "nazov2" : "hodnota2"}) - nastavý všétkým atribútom hodnoty;
 */
G.prototype.attr = function(...args){
	if(this.isEmpty())
		return this;
	var i;

	//ak je 0 argumentov vráti objekt z atribútmi
	if(args.length == 0){
		var result = {};
		for(i=0 ; i<this.first().attributes.length ; i++)
			result[this.first().attributes[i].nodeName] = this.first().attributes[i].nodeValue;
		return result;
	}

	//ak je prvý argument string
	if(G.isString(args[0])){
		//a druhý argument je zadaný a dá sa prepísať na string nastav štýl
		if(args.length == 2 && G.isToStringable(args[1])){
			this.first().setAttribute(args[0], args[1]);
		}
		//ak prvý argument neobsahuje symbol pre vymazanie tak vráť hodnotu štýlu
		else if(args[0][0] !== "-"){
			return this.first().getAttribute(args[0]);
		}
		//ináč štýl odstráň
		else{
			this.first().removeAttribute(args[0].substring(1));
		}
	}
	//ak je prvý argument objekt nastav všetky štýli podla objektu
	else if(G.isObject(args[0]))
		for(i in args[0])
			if(args[0].hasOwnProperty(i) && G.isString(i) && G.isToStringable(args[0][i]))
				this.first().setAttribute(i, args[0][i]);
	return this;
};
