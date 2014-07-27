/*
 * pxScript
 *
 * created by Ondřej Bárta alias PageOnline
 *
 */

(function(window, document, undefined) {

'use strict';

if(typeof pxApp !== 'undefined') {
	return false;
}

var pxError = function(message) {
	console.error(new Error(message).stack);
}

/*
 * polyfill
 */

if(!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

/*
 *
 */

var isNumber = function(value) {
	return isNaN(+value) ? false : true;
}

var isString = function(value) {
	return typeof value == 'string';
}

var isArray = function(value) {
	return toString.call(value) == '[object Array]';
}

function isWindow(obj) {
	return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

var isArrayLike = function(obj) {
	if (obj == null || isWindow(obj)) {
		return false;
	}
	var length = obj.length;
	if (obj.nodeType === 1 && length) {
		return true;
	}
	return isString(obj) || isArray(obj) || length === 0 || typeof length === 'number' && length > 0 && (length - 1) in obj;
}

var isObject = function(value) {
	if(isString(value)) { value = JSON.parse(value) } return toString.call(value) == '[object Object]'
}

var isFunction = function(value) {
	return typeof value === 'function';
}

var isUndefined = function(value) {
	return typeof value === 'undefined';
}

var isDefined = function(value) {
	return typeof value !== 'undefined';
}

var isCamelCase = function(value) {
	return value.indexOf('-') ? false : true;
}

var toBool = function(value) {
	return ((value + '').toLowerCase() == 'true') ? true : false;
}

var toCamelCase = function(value) {
	return value.replace(/\-(.)/g, function($0, $1) {
		return $1.toUpperCase();
	});
}

var toDashCase = function(value) {
	return value.replace(/([A-Z])/g, function($0, $1) {
		return '-' + $1.toLowerCase();
	});
}

var mergeObjects = function() {
	var arg;
	if(isArrayLike(arguments[0])) {
		arg = arguments[0];
	} else {
		arg = arguments;
	}
	var obj = {};
	forEach(arg, function(prop, key) {
		forEach(prop, function(prop, key) {
			obj[key] = prop;
		});
	});
	return obj;
}

var forEach = function(value, fn) {
	if(isObject(value)) {
		var arr = Object.keys(value);
		for(var i = 0; i < arr.length; ++i) {
			fn.call(this, value[arr[i]], arr[i], i);
		}
	} else if(isArrayLike(value)) {
		for(var i = 0; i < value.length; ++i) {
			fn.call(this, value[i], value[i], i);
		}
	}
}



var regex = {
	path: /^[A-Za-z_][A-Za-z_0-9\.\[\]\"\']*$/,
	operators: /[\+\-\*\/]/
}

/* Evaluation */

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
			if(isUndefined(pointer[nesting[i]])) {
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
			} else if(string[i].match(regex.operators)) {
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

		var calcChar = [];
		for(var i = 0; i < string.length; ++i) {
			if(string[i].match(regex.operators)) {
				calcChar.push(string[i]);
			}
		}

		var exps = string.split(regex.operators);
		
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
				if(isFunction(obj.data[temp])) {
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
						if(isDefined(calcChar[iii])) {
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
			variables.push($2.trim());
			if(isNumber(calculated)) {
				return ':' + calculated;
			} else if(isObject(calculated)) {
				return ':' + JSON.stringify(calculated);
			} else if(calculated[0].match(/^[\'\"].*[\'\"]$/)) {
				return ':' + calculated;
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
	command: function(string, obj, self) {
		var tempStr = string.trim();
		if(tempStr.match(/^[a-zA-Z_0-9\.\[\'\"\]]+\s*(\+|\-|\*|\/)=\s*(.*)/)) {
			tempStr = tempStr.replace(/^([a-zA-Z_0-9\.\[\'\"\]]*)+\s*(\+|\-|\*|\/)=\s*(.*)/, function($0, $1, $2, $3) {
				obj.set($1, self.calc($1 + $2 + $3, obj));
			});
		} else if(tempStr.match(/^[a-zA-Z_0-9\.\[\'\"\]]+\s*=\s*(.*)/)) {
			tempStr = tempStr.replace(/^([a-zA-Z_0-9\.\[\'\"\]]*)+\s*=\s*(.*)/, function($0, $1, $2) {
				obj.set($1, self.calc($2, obj));
			});
		} else if(tempStr.match(/\{[\s\S]*\}/)) {
			console.log(self);
			return self.json(tempStr, obj);
		} else {
			return self.calc(tempStr, obj);
		}
	},
	eval: function(string, obj) {
		var arr = string.split(';');
		var self = this;
		if(arr.length == 1) {
			return this.command(arr[0], obj, this);
		} else {
			forEach(arr, function(param) {
				self.command(param, obj, self);
			});
		}
	}
}

/* Ajax */

var pxHttp = {
	parseHeaders: function(string) {
		var key;
		var obj = {};
		var arr = string.split(/[\n\r]/);
		forEach(arr, function(value) {
			if(value != '') {
				key = value.substr(0, value.indexOf(':'));
				value = value.substr(value.indexOf(':') + 1);
				key = toCamelCase(key.toLowerCase());
				obj[key] = value.trim();
			}
		});
		return obj;
	},
	stringifyData: function(obj) {
		var parts = [];
		forEach(obj, function(value, key) {
			parts.push(key + '=' + value);
		});
		return encodeURI(parts.join('&'));
	},
	createUrl: function(url, obj) {
		return encodeURI(url + '?' + this.stringifyData(obj));
	},
	requestHeaders: {
		post: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	},
	request: function(obj) {
		var req = new window.XMLHttpRequest() || new ActiveXObject('Microsoft.XMLHTTP');
		var self = this;
		var response;
		obj.url = this.createUrl(obj.url, obj.params);
		req.open(obj.method || 'GET', obj.url, false);
		forEach(this.requestHeaders, function(value, key) {
			if(obj.method.toLowerCase() == key) {
				forEach(value, function(value, key) {
					if(isDefined(value)) {
						req.setRequestHeader(key, value);
					}
				});
			}
		});
		forEach(obj.headers, function(value, key) {
			if(isDefined(value)) {
				req.setRequestHeader(key, value);
			}
		});
		req.addEventListener('readystatechange', function() {
			if(this.readyState == 4) {
				try {
					response = JSON.parse(this.response);
				} catch(err) {
					response = this.response;
				}
				var headers = self.parseHeaders(this.getAllResponseHeaders());
				if(this.status == 200 && obj.success) {
					obj.success.call(obj, response, this.status, headers);
				} else if(obj.error) {
					obj.error.call(obj, response, this.status, headers);
				}
			}
		}, false);
		var events = ['loadstart', 'progress', 'error', 'abort', 'load', 'loadend'];
		forEach(events, function(value){
			if(obj[value]) {
				req.addEventListener('on' + value, obj[value], false);
			}
		});
		if(obj.data) {
			req.send(this.stringifyData(obj.data));
		} else {
			req.send(null);
		}
	}
}

/* Elements */

var pxElement = function() {
	this.elements = {};
	this.create = function(name, obj) {
		var element;
		if(name.indexOf('<') != -1 && name.indexOf('>') != -1) {
			element = document.createElement('div');
			element.innerHTML = name;
			element = element.childNodes[0];
		} else {
			element = document.createElement(name);
			forEach(obj, function(value, key) {
				element[key] = value;
			});
		}
		return element;
	};
	this.register = function(name, fn) {
		this.elements[name] = fn;
	};
};

/* Data binding */

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
			if(temp.match(regex.path)) {
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
		var self = this;
		if(isDefined(element.value)) {
			this.bind(name, element.value);
		} else {
			this.bind(name, element.textContent);
		}
		element.addEventListener('input', function() {
			obj.set(name, this.value);
			self.bind(name, this.value, true);
		}, false);
	};
	this.bind = function(name, value, html) {
		var html = html || false;
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
				if(isDefined(input.value)) {
					input.value = value;
				} else {
					input.textContent = value;
				}
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
};

/* Dependency injection */

var pxInjector = function() {
	this.dependencies = {};
	this.register = function(name, fn) {
		if(!this.dependencies[name]) {
			this.dependencies[name] = fn;
		} else {
			pxError('Dependency named \'' + name + '\' already exist.');
		}
	};
	this.importDependencies = function(injector) {
		this.dependencies = mergeObjects(this.dependencies, injector.dependencies);
	};
	this.getDependencies = function(fn) {
		var dependencies = [];
		if(!isFunction(fn)) return false;
		fn.toString().replace(/^function\s*.*\s*[^\(]\((.*[^\(])\)/, function($0, $1) {
			var tempArr = $1.split(',');
			for(var i = 0; i < tempArr.length; ++i) {
				dependencies.push(tempArr[i].trim());
			}
		});
		return this.findDependencies(dependencies);
	};
	this.findDependencies = function(arr) {
		var self = this;
		return arr.map(function(value) {
			if(self.dependencies[value]) {
				return self.dependencies[value];
			} else {
				pxError('Dependency named \'' + value + '\' doesn\'t exist.');
				return false;
			}
		});
	};
	this.inject = function(fn, elem) {
		var arr = [];
		var dependencies = this.getDependencies(fn);
		var self = this;
		forEach(dependencies, function(value) {
			arr.push(value.apply(this, elem));
		});
		fn.apply(fn, arr);
	};
	self = this;
	forEach(arguments, function(value) {
		self.importDependencies(value);
	});
};

/* Custom elements and attributes */

var pxCustomDOM = function() {
	this.attributes = [];
	this.elements = [];
	this.registerAttribute = function(name, obj) {
		name = toCamelCase(name);
		var o = {}
		o[name] = obj;
		this.attributes.push(o);
	};
	this.registerElement = function(name, obj) {
		name = toCamelCase(name);
		var o = {}
		o[name] = obj;
		this.elements.push(o);
	};
	this.parse = function(elem) {
		var attrs, elems, name;
		forEach(this.attributes, function(customAttribute) {
			name = Object.keys(customAttribute)[0];
			attrs = elem.querySelectorAll('[' + toDashCase(name) + ']');
			forEach(attrs, function(item) {
				customAttribute[name].fn(undefined, item, item.getAttribute(toDashCase(name)));
			});
		});
		forEach(this.elements, function(customElement) {
			name = Object.keys(customElement)[0];
			attrs = elem.getElementsByTagName(toDashCase(name));
			forEach(attrs, function(item) {
				customElement[name].fn(undefined, item);
			});
		});
	};
};

var pxDOM = new pxCustomDOM();

pxDOM.registerAttribute('pxClick', {
	fn: function(px, element, attribute) {
		console.log(px);
		element.addEventListener('click', function(event) {
			console.log(element);
		}, false);
	}
});

pxDOM.registerAttribute('pxInclude', {
	fn: function(px, element, attribute) {
		pxHttp.request({
			method: 'GET',
			url: attribute,
			success: function(data) {
				element.outerHTML = data;
				pxDOM.parse(element);
			}
		});
	}
});

pxDOM.registerElement('pxInclude', {
	fn: function(px, element) {
		pxHttp.request({
			method: 'GET',
			url: element.getAttribute('src'),
			success: function(data) {
				element.outerHTML = data;
				pxDOM.parse(element);
			}
		});
	}
});

/* some variables */

var scopeInjector = new pxInjector();

scopeInjector.register('px', function px(element) {
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
		log: function(name) {
			if(isString(name)) {
				console.log(this.eval(name));
			} else {
				console.log(name);
			}
		},
		eval: function(string) {
			if(string.match(regex.path)) {
				return pxEval.path(string, this);
			} else {
				return pxEval.eval(string, this);
			}
		},
		element: function(name, obj) {
			var element = scopeElement.create(name, obj);
			binder.parseHTML(element);
			return element;
		}
	};
	var binder = new pxBinder(element, px);
	return px;
});

scopeInjector.register('http', function http() {
	return function(obj) {
		if(isDefined(obj) && isObject(obj)) {
			pxHttp.request(obj);
		} else {
			var tempObj = {};
			forEach(['GET', 'POST', 'HEAD', 'DELETE', 'JSONP', 'PUT'], function(value) {
				tempObj[value.toLowerCase()] = function(obj) {
					pxHttp.request(mergeObjects({ method: value }, obj));
				}
			});
			return tempObj;
		}
	};
});

scopeInjector.register('element', function element(element) {

	return element;
});

var appInjector = new pxInjector(scopeInjector);

appInjector.register('hash', function hash() {
	var mem = [], temp, duplicatePrevent = false, lastHash = null;
	var hashchange = function(event) {
		event.stopPropagation();
		if(!(/^#!\/.*/.test(location.hash))) {
			duplicatePrevent = true;
		}
		forEach(mem, function(item) {
			temp = location.hash.replace(/^#!?\/?/, '/');
			if(item.path != temp) return false;
			location.hash = '#!' + temp;
			if(item.fn && !duplicatePrevent && lastHash != temp) {
				item.fn();
			} else {
				duplicatePrevent = false;
			}
			lastHash = temp;
		});
	};
	window.addEventListener('DOMContentLoaded', hashchange, false);
	window.addEventListener('hashchange', hashchange, false);
	var self = {
		when: function(path, obj) {
			mem.push(mergeObjects({ path: path }, obj));
			return self;
		}
	};
	return self;
});

appInjector.register('', function() {});

var apps = {};

window.pxApp = function(appName, fn) {
	apps[appName] = {
		injector: new pxInjector(scopeInjector),
		appInjector: new pxInjector(appInjector)
	}

	if(fn) {
		var appElement = document.querySelector('[px-app]');
		apps[appName].appInjector.inject(fn, [appElement]);
		pxDOM.parse(appElement);
	}

	return {
		name: appName,
		scope: function(name, fn) {
			var elem;
			var elems = document.querySelectorAll('[px-scope]');
			for(var i = 0; i < elems.length; ++i) {
				if(elems[i].getAttribute('px-scope') === name) {
					elem = elems[i];
					break;
				}
			}
			pxDOM.parse(elem);
			apps[appName].injector.inject(fn, [elem]);
			return this;
		},
		service: function(name, fn) {
			apps[appName].injector.register(name, fn);
			return this;
		},
		include: function(name) {
			apps[appName].injector.importDependencies(apps[name].injector);
			return this;
		},
		attribute: function(name, obj) {
			pxDOM.registerAttribute();
		},
		element: function(name, obj) {
			;
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
 * Evaluation function										// DONE
 * Creating elements and attributes							// 
 * Support for custom elements and shadow DOM 				// 
 * Ajax pattern of sending data								//
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */