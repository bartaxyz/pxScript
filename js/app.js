var yourApp = pxApp('yourApp');

yourApp.service('api_2', function() {
	return {
		blah: 'blah'
	}
});

var myApp = pxApp('myApp', function(px, hash) {
	hash.when('/Home', {
		fn: function() {
			console.log('you are home');
		}
	}).when('/Out', {
		fn: function() {
			console.log('you are out');
		}
	});
}).include('yourApp');

myApp.scope('main-scope', function(px) {
	px.set('console.log', function() {
		console.log('event');
	});
	px.eval('console.log()');
});

myApp.scope('example1', function(px, http, element) {
	px.set('name', 'Martin', true);
	px.set('console.log', function() {
		console.log('event');
	});
});

myApp.scope('example2', function(px) {
	px.set('name', 'Martin');
	px.set('count', 0);
	px.watch('name', function() {
		px.set('count', px.get('count') + 1);
	});
});

myApp.scope('example3', function(px) {
	px.set('name', 'Martin');
	px.set('count', 0);
	px.watch('name', function() {
		px.eval('count = count + 1');
	});
});