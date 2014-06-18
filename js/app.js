var yourApp = pxApp('yourApp');

yourApp.register('api_2', function() {
	return {
		blah: 'blah'
	}
});

var myApp = pxApp('myApp');

myApp.include('yourApp');

myApp.scope('example1', function(px, http, api_2, element) {
	px.set('name', 'Martin', true);
	px.set('console.log', function(event) {
		console.log(event);
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