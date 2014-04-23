var myApp = pxApp();

myApp.register('api', function() {
	return {
		getUsers: function() {
			// TODO: ajax API call
		}
	};
});

myApp.scope('example1', function(px) {
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
		px.bind('count');
	})
});