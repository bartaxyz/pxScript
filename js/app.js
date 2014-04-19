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

myApp.scope('main-scope', function(px, api) {
	px.set('name', 'Martin');
	px.get('name'); // Martin
	px.watch('name', function() {
		// Calls after name change
	});
});