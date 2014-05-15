var yourApp = pxApp();
yourApp.register('api_2', function api_2() {
	return {
		blah: 'blah'
	}
});

var myApp = pxApp();

myApp.include(yourApp);

myApp.register('api', function api() {
	return {
		set: function(string) {
			;
		}
	};
});

myApp.scope('example1', function(px, http) {
	px.set('name', 'Martin', true);
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