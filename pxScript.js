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
			if(!this.elements.binds[binds[i].getAttribute('px-bind')]) {
				this.elements.binds[binds[i].getAttribute('px-bind')] = [];
			}
			this.elements.binds[binds[i].getAttribute('px-bind')].push(binds[i]);
		}
		for(var i = 0; i < inputs.length; ++i) {
			this.registerInput(inputs[i]);
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
	this.bind = function(name, value) {
		var input, bind;
		if(!this.elements.inputs[name]) {
			this.elements.inputs[name] = [];
		}
		if(!this.elements.binds[name]) {
			this.elements.binds[name] = [];
		}
		for(var i = 0; i < this.elements.inputs[name].length; ++i) {
			input = this.elements.inputs[name][i];
			input.value = value;
		}
		for(var i = 0; i < this.elements.binds[name].length; ++i) {
			bind = this.elements.binds[name][i];
			bind.textContent = value;
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
		console.log(this.dependencies);
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
			set: function(name, value) {
				var pointer = this.data;
				var nesting = name.split('.');
				for(var i = 0; i < nesting.length - 1; ++i) {
					if(typeof pointer[nesting[i]] == 'undefined') {
						pointer[nesting[i]] = {};
					}
					pointer = pointer[nesting[i]];
				}
				pointer[nesting[nesting.length - 1]] = value;
				this.bind(name, value);
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
			bind: function(name, value) {
				binder.bind(name, value);
			},
			watch: function(name, fn, run) {
				var bool = run || false;
				if(bool) {
					fn();
					bool = false;
				}
				this.watchers[name] = fn;
			}
		};
		var binder = new pxBinder(element, px);
		return px;
	}
});

/*
 * Dependency: ajax
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

pxInjector.createDependency('pxHttp', {
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

/*var init = function() {}

window.addEventListener('DOMContentLoaded', function(ev) {
	init();
	ev.stopPropagation();
}, false);*/

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
 * Data binding												//
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