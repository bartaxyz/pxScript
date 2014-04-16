var myApp = pxApp();

myApp.register('api', {
	value: function() {
		return {
			getUsers: function() {}
		};
	}
});

myApp.scope('main-scope', function(px, api) {
	px.set('blah', 6453120);
	px.set('fn', function() {
		return 5;
	});
	console.log(px.eval('fn() + 5'));
});