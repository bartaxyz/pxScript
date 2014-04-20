/*
 *
 *
 *
 *
 *
 */

(function(window, document, undefined) {

'use strict';

if(typeof pxApp !== 'undefined') {
	return false;
}

/*
 * pxError
 *
 * description:
 *		outputs and error and all callers
 *
 * example: 
 *		pxError('Access denied!'); // console outputs an error and function callers
 *
 * returns:
 *		'undefined'
 *
 */

var pxError = function(message) {
	console.error(new Error(message).stack);
}

/*
 * isNumber 	
 *
 * description:
 *		return true or false based on that value is or isn't number
 *
 * example: 
 *		isNumber(50);		// true
 *		isNumber('50');		// true
 *		isNumber('50f');	// false
 *		isNumber('hey125');	// false
 *
 * returns:
 *		true if is number, even if it's number string
 *
 */

var isNumber = function(value) { return isNaN(+value) ? false : true; }
var isString = function(value) { return typeof value == 'string' }
var isArray = function(value) { return toString.call(value) == '[object Array]'}
var isObject = function(value) { if(isString(value)) { value = JSON.parse(value) } return toString.call(value) == '[object Object]'}
var isUndefined = function(value){ return typeof value === 'undefined' }
var isDefined = function(value){ return typeof value !== 'undefined' }

var toBool = function(value) { return ((false + '').toLowerCase() == 'true') ? true : false }

/*
 * evaluation
 */

var pxEval = {
	path: function(string, obj) {
		if(string.match(/\(.*\)$/)) {
			string = string.replace(/(\(.*\))$/, '');
		}
		string = string.replace(/\[/g, '.');
		string = string.replace(/[\\]/g, '');
		var pointer = obj.data;
		var nesting = string.split(/[\[\.]/);
		for(var i = 0; i < nesting.length; ++i) {
			if(nesting[i][nesting[i].length - 1] == ']') {
				nesting[i] = nesting[i].replace(/[\'\"\]]/g, '');
			}
			if(typeof pointer[nesting[i]] == 'undefined') {
				pointer[nesting[i]] = {};
			}
			pointer = pointer[nesting[i]];
		}
		return pointer;
	},
	calculate: function(firstValue, secondValue, operator) {
		if(operator == '+') return firstValue + secondValue;
		else if(operator == '-') return firstValue - secondValue;
		else if(operator == '*') return firstValue * secondValue;
		else if(operator == '/') return firstValue / secondValue;
	},
	calc: function(string, obj) {

		var nestedBrackets = 0;
		var tempString = '';
		var resultString = '';
		var nestedBracketsWrite = true;
		var calculating = true;

		for(var i = 0; i < string.length; ++i) {
			if(string[i] == '(') {
				++nestedBrackets;
				if(nestedBrackets == 1) {
					nestedBracketsWrite = false;
				}
			} else if(string[i] == ')') {
				--nestedBrackets;
				if(nestedBrackets == 0) {
					tempString = this.calc(tempString.replace('(', ''), obj);
					if(!isNaN(tempString)) {
						resultString += tempString;
					}
					tempString = '';
					nestedBracketsWrite = true;
				}
			} else if(string[i].match(/[\+\-\*\/]/)) {
				;
			} else if(string[i].match(/[a-zA-Z]/)) {
				;
			}
			if(nestedBracketsWrite) {
				resultString += string[i];
			} else {
				tempString += string[i];
			}
		}
		string = resultString.replace(/\)/g, '');

		console.log(string);

		var calcChar = [];
		for(var i = 0; i < string.length; ++i) {
			if(string[i].match(/[\+\-\*\/]/)) {
				calcChar.push(string[i]);
			}
		}

		var exps = string.split(/[\+\-\*\/]/);
		
		if(isNumber(exps[0])) {
			var result = 0;
		} else {
			var result = '';
		}
	
		var quote;
		var quoteCount = 0;
		var exp;
		var values = [];
		var re;
	
		for(var i = 0; i < exps.length; ++i) {
			exp = exps[i];
			exp = exp.trim();
			if(isNumber(exp)) {
				exp = parseFloat(exp, 10);
			} else if(exp.match(/^\".*\"$/) || exp.match(/^\'.*\'$/)) {
				quote = exp[0];
			
				for(var ii = 0; ii < exp.length; ++ii) {
					if(exp[ii] === quote) {
						if(ii - 1 < 0) {
							continue;
						} else if(exp[ii - 1] === '\\') {
							continue;
						} else {
							++quoteCount;
						}
					}
				}

				if(quoteCount !== 1) {
					return pxError('Expression ' + string + ' isn\'t valid.');
				} else {
					quoteCount = 0;
				}

				var re = new RegExp('^' + quote + '(.*)' + quote + '$'); 

				exp.replace(re, function($0, $1) {
					exp = $1;
					exp = exp.replace(/\\\'/g, '\'');
				});

			} else {
				var temp = exp.replace(/[\\\']/g, '');
				if(typeof obj.data[temp] == 'function') {
					exp = this.path(exp, obj).apply(this, []);
				} else {
					exp = this.path(exp, obj);
				}
			}

			values.push(exp);
		}
		var operators = ['/', '*', '+', '-'];
		var newArr;
		var index;
		for(var i = 0; i < operators.length; ++i) {
			for(var ii = 0; ii < calcChar.length; ++ii) {
				if(calcChar[ii] == operators[i]) {
					values[ii] = this.calculate(values[ii], values[ii + 1], operators[i]);
					newArr = [];
					for(var iii = 0; iii < values.length; ++iii) {
						newArr.push(values[iii]);
						if(iii == ii) {
							++iii;
						}
					}
					values = newArr;
					newArr = [];
					for(var iii = 0; iii < calcChar.length; ++iii) {
						if(iii == ii) {
							++iii;
						}
						if(typeof calcChar[iii] != 'undefined') {
							newArr.push(calcChar[iii]);
						}
					}
					calcChar = newArr;
					--ii;
				}
			}
		}
		if(isNumber(values[0])) {
			return parseInt(values[0]);
		} else {
			return values[0];
		}
	},
	json: function(string, obj) {
		var variables = [];
		var self = this;
		string = string.replace(/(:\s*)([\"\'a-zA-Z0-9][\"\'a-zA-Z0-9\s\+\-\*\/\\]*)/g, function($0, $1, $2) {
			var calculated = self.calc($2, obj);
			console.log(JSON.stringify(calculated));
			variables.push($2.trim());
			if(isNumber(calculated)) {
				return ':' + calculated;
			} else if(isObject(calculated)) {
				return ':' + JSON.stringify(calculated);
			} else {
				return ': "' + calculated + '"';
			}
		});
		string = string.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"');
		string = string.replace(/\"\"/g, '"');
		return {
			result: JSON.parse(string),
			variables: variables
		};
	},
	eval: function(string, obj) {
		if(string.match(/\{[\s\S]*\}/)) {
			console.log(string);
			return this.json(string, obj);
		} else {
			return this.calc(string, obj);
		}
	}
}

/*
 * Data binding
 */

var pxBinder = function(root, obj) {
	this.elements = {
		binds: {},
		inputs: {}
	};
	this.parseHTML = function(doc) {
		var binds = doc.querySelectorAll('[px-bind]');
		var inputs = doc.querySelectorAll('[px-input]');
		for(var i = 0; i < binds.length; ++i) {
			this.registerBind(binds[i]);
		}
		for(var i = 0; i < inputs.length; ++i) {
			this.registerInput(inputs[i]);
		}
	};
	this.registerBind = function(element) {
		var arr = element.getAttribute('px-bind').split('+');
		var indexes = [];
		var temp;
		for(var i = 0; i < arr.length; ++i) {
			arr[i] = arr[i].trim();
			temp = arr[i];
			if(temp.match(/^[A-Za-z_][A-Za-z_0-9\.\[\]]*$/)) {
				indexes.push(i);
			}
		}
		for(i = 0; i < indexes.length; ++i) {
			if(!this.elements.binds[arr[indexes[i]]]) {
				this.elements.binds[arr[indexes[i]]] = [];
			}
			this.elements.binds[arr[indexes[i]]].push(element);
		}
	};
	this.registerInput = function(element) {
		if(!this.elements.inputs[element.getAttribute('px-input')]) {
			this.elements.inputs[element.getAttribute('px-input')] = [];
		}
		this.elements.inputs[element.getAttribute('px-input')].push(element);
		var name = element.getAttribute('px-input');
		if(element.value) {
			this.bind(name, element.value);
		}
		var self = this;
		element.addEventListener('input', function() {
			obj.set(name, this.value);
			self.bind(name, this.value);
		}, false);
	};
	this.bind = function(name, value, html) {
		html = html || false;
		var input, bind;
		if(!this.elements.inputs[name]) {
			this.elements.inputs[name] = [];
		}
		if(!this.elements.binds[name]) {
			this.elements.binds[name] = [];
		}
		for(var i = 0; i < this.elements.inputs[name].length; ++i) {
			input = this.elements.inputs[name][i];
			if(input != document.activeElement) {
				input.value = value;
			}
		}
		for(var i = 0; i < this.elements.binds[name].length; ++i) {
			bind = this.elements.binds[name][i];
			if(html) {
				bind.innerHTML = obj.eval(bind.getAttribute('px-bind'));
			} else {
				bind.textContent = obj.eval(bind.getAttribute('px-bind'));
			}
		}
	};

	this.parseHTML(root);
}

/*
 * Dependency injection
 */

var pxInjector = {
	dependencies: {},
	createDependency: function(name, obj) {
		if(!this.dependencies[name]) {
			this.dependencies[name] = obj;
		} else {
			pxError('Dependency named \'' + name +'\' already exist.');
		}
	},
	getDependencies: function(fn) {
		var dependencies = [];
		fn.toString().replace(/^function\s*[^\(]\((.*[^\(])\)/, function($0, $1) {
			var tempArr = $1.split(',');
			for(var i = 0; i < tempArr.length; ++i) {
				dependencies.push(tempArr[i].trim());
			}
		});
		return this.findDependencies(dependencies);
	},
	findDependencies: function(arr) {
		var self = this;
		return arr.map(function(value) {
			if(self.dependencies[value]) {
				return self.dependencies[value];
			} else {
				pxError('Dependency named \'' + value + '\' doesn\'t exist.');
				return false;
			}
		});
	},
	inject: function(fn, args) {
		var arr = [];
		var dependencies = this.getDependencies(fn);
		for(var i = 0; i < dependencies.length; ++i) {
			if(dependencies[i].value) {
				arr.push(dependencies[i].value.apply(this, args));
			}
		}
		fn.apply(fn, arr);
	}
};

/*
 * Dependency: px
 *
 * methods:
 *	set()
 *	get()
 *	bind()
 *	watch()
 *	eval()
 *
 * variables:
 *	watchers
 *	data
 *	rootElement
 *
 */

pxInjector.createDependency('px', {
	value: function(element) {
		var px = {
			watchers: {},
			data: {},
			rootElement: element,
			set: function(name, value, html) {
				var pointer = this.data;
				var nesting = name.split('.');
				for(var i = 0; i < nesting.length - 1; ++i) {
					if(typeof pointer[nesting[i]] == 'undefined') {
						pointer[nesting[i]] = {};
					}
					pointer = pointer[nesting[i]];
				}
				pointer[nesting[nesting.length - 1]] = value;
				this.bind(name, value, html);
				if(this.watchers[name]) {
					this.watchers[name]();
				}
			},
			get: function(name) {
				var pointer = this.data;
				var nesting = name.split('.');
				for(var i = 0; i < nesting.length - 1; ++i) {
					pointer = pointer[nesting[i]];
				}
				return pointer[nesting[nesting.length - 1]];
			},
			bind: function(name, value, html) {
				binder.bind(name, value, html);
			},
			watch: function(name, fn, run) {
				var bool = run || false;
				if(bool) {
					fn();
					bool = false;
				}
				this.watchers[name] = fn;
			},
			eval: function(string) {
				if(string.match(/^[A-Za-z_][A-Za-z_0-9\.\[\]]*$/)) {
					return pxEval.path(string, this);
				} else {
					return pxEval.eval(string, this);
				}
			}
		};
		var binder = new pxBinder(element, px);
		return px;
	}
});

/*
 * Dependency: http
 *
 * methods:
 *	get()
 *	post()
 *	
 *	
 *
 * variables:
 *	
 *	
 *	
 *
 */

/*
 * TODO

pxInjector.createDependency('http', {
	value: function() {
		return {
			get: function(path) {
				;
			},
			post: function(path) {
				;
			}
		};
	}
});
*/

window.pxApp = function(fn) {

	if(fn) {
		var appElement = document.querySelector('[px-app]');
		pxInjector.inject(fn, [appElement]);
	}
	
	return {
		scope: function(name, fn) {
			var elem;
			var elems = document.querySelectorAll('[px-scope]');
			for(var i = 0; i < elems.length; ++i) {
				if(elems[i].getAttribute('px-scope') === name) {
					elem = elems[i];
					break;
				}
			}
			pxInjector.inject(fn, [elem]);
		},
		register: function(name, fn) {
			pxInjector.createDependency(name, fn);
		}
	}
}


})(window, document);

/*
 *
 * TODO:
 *
 * Functions with dependency injection and scopes			// DONE
 * Data binding												// DONE
 * Evaluation function										// 
 * Creating elements										// 
 * Support for custom elements and shadow DOM 				// 
 *
 *
 *
 *
 *
 *
 *
 */