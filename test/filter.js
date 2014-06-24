
var reem = require('reem')("./"),
	flow = require('.././lib/index')(reem),
	assert = require('assert');

function inc(i,c,n) {
	i.i = i.i || 0;
	c.i = c.i || 0;
	i.i++;
	c.i++;
	n(null, i);
}

function after(t, f) {
	t = t || 1;
	return function() {
		t--;
		if(t === 0) f();
	}
}

describe('Filter', function() {
	var control = flow.filter.bind(flow);
	describe('#constructor()', function() {
		it('should accept a filter function', function(done) {
			var f = control(function(item) {
					return item.draft;
				}).use(inc),
				next = after(2, done);

			f({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false});
				next();
			});
			f({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i:1});
				next();
			});
		});

		it('should accept a matching object', function(done) {
			// see Underscore 1.6.0 `matches` function
			// http://underscorejs.org/#matches

			var f = control({draft: true}).use(inc),
				next = after(2, done);

			f({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false});
				next();
			});
			f({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i:1});
				next();
			});
		});

		it('should accept an object property', function(done) {
			var f = control('draft').use(inc),
				next = after(2, done);

			f({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false});
				next();
			});
			f({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i:1});
				next();
			});
		});

		it('should accept a dot-access object property String', function(done) {
			// "nested.property" => item[nested][property]

			var f = control('nested.draft').use(inc),
				next = after(2, done);

			f({nested: {draft: false}}, {}, function(error, item) {
				assert.deepEqual(item, {nested: {draft: false}});
				next();
			});
			f({nested: {draft: true}}, {}, function(error, item) {
				assert.deepEqual(item, {nested: {draft: true}, i:1});
				next();
			});
		});

		it('should accept a object property and value', function(done) {
			var f = control('draft', true).use(inc),
				next = after(2, done);

			f({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false});
				next();
			});
			f({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i:1});
				next();
			});
		});

		it('should accept a dot-access object property String and value', function(done) {
			// "nested.property" => item[nested][property]

			var f = control('nested.draft', true).use(inc),
				next = after(2, done);

			f({nested: {draft: false}}, {}, function(error, item) {
				assert.deepEqual(item, {nested: {draft: false}});
				next();
			});
			f({nested: {draft: true}}, {}, function(error, item) {
				assert.deepEqual(item, {nested: {draft: true}, i:1});
				next();
			});
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop'), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft');
			assert.equal(f, f.use(inc));
		});
	});
	describe('#use()', function() {
		it('should return a plugin function', function() {
			assert.equal(typeof control('prop').use(inc), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft');
			assert.equal(f, f.use(inc));
		});
	});
});