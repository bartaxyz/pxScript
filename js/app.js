var myApp = pxApp();

myApp.register('api', {
	value: function() {
		return {
			getUsers: function() {
				// TODO: ajax API call
			}
		};
	}
});

myApp.scope('example1', function(px, api) {
	px.set('name', 'Martin');
});

myApp.scope('example2', function(px) {
	px.set('name', 'Martin');
	px.set('count', 0);
	px.watch('name', function() {
		px.set('count', px.get('count') + 1);
	});
});