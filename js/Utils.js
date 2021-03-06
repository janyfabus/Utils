function changeIfEqual(variable, value, newValue){
    return variable == value ? newValue : variable;
}

function isIn(obj){
	for(var i=1 ; i<arguments.length ; i++)
		if(arguments[i] === obj)
			return true;

	return false;
}

function isFunction(val){
	return typeof val === "function";
}

function callIfFunc(val){
	return isFunction(val) ? val() : false;
}

function isUndefined(val){
	return typeof val === "undefined";
}

function isInt(n){
	return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
	return Number(n) === n && n % 1 !== 0;
}

function negate(func) {
	return function(x) {
		return !func(x);
	};
}

function equal(el1, el2){
	return el1 == el2;
}

function greaterThen(el1, el2){
	return el1 > el2;
}

function lessThen(el1, el2){
	return el1 < el2;
}

Array.prototype.sum = function(total = 0) {
	this.forEach(number => total += number);
	return total;
}

Array.prototype.max = function(numbers) {
	var max, j = 0;
	this.forEach(number => max = equal(j++, 0) ? number : (greaterThen(max, number) ? max : number));
	return max;
}

Array.prototype.range = function(min, max, result = []){
	this.forEach(number => greaterThen(number, min - 1) && lessThen(number, max + 1) && result.push(number));
	return result;
}

Array.prototype.avg = function(result = 0){
	return this.sum() / this.length;
}

Array.prototype.min = function(numbers) {
	var min, j = 0;
	this.forEach(number => min = equal(j++, 0) ? number : (lessThen(min, number) ? min : number));
	return min;
}

Array.prototype.head = function(){//existuje shift - ale ten vymazava
	this.length > 0 ? this[0] : false;
}

Array.prototype.last = function(){//existuje pop - ale ten vymazava
	this.length > 0 ? this[this.length - 1] : false;
}

Array.prototype.merge = function(){
	return this.concat().sort();
}

Array.prototype.product = function(func, result = []){
	this.forEach(element => result.push(func(element)));
	return result;
}
