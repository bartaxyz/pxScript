var myApp = pxApp();

myApp.register('api', function api() {
	return {
		set: function(string) {
			;
		}
	};
});

myApp.scope('example1', function(px, http, element) {
	px.set('name', 'Martin');
});
/*
myApp.scope('example2', function(px, api) {
	px.set('name', 'Martin');
	px.set('count', 0);
	px.watch('name', function() {
		px.set('count', px.get('count') + 1);
	});
});

/*myApp.scope('example3', function(px, api) {
	px.set('name', 'Martin');
	px.set('count', 0);
	px.watch('name', function() {
		px.eval('count = count + 1');
	})
});*/