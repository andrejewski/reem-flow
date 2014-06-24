
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

describe('Toggle', function() {
	var control = flow.toggle.bind(flow);
	describe('#constructor()', function() {

		it('should accept a filter function', function(done) {
			var f = control(function(item) {
					return item.draft;
				}).on(inc),
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

			var f = control({draft: true}).on(inc),
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
			var f = control('draft').on(inc),
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

			var f = control('nested.draft').on(inc),
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
			var f = control('draft', true).on(inc),
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

			var f = control('nested.draft', true).on(inc),
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
			assert.equal(f, f.on(inc));
			assert.equal(f, f.off(inc));
			assert.equal(f, f.on(inc).off(inc));
		});
	});
	describe('#on()', function() {
		it('should apply only to truthy items', function(done) {
			var f = control('draft').on(inc).on(inc).off(inc),
				next = after(2, done);

			f({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false, i:1});
				next();
			});
			f({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i:2});
				next();
			});
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop').on(inc), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft');
			assert.equal(f, f.on(inc));
		});
	});
	describe('#off()', function() {
		it('should apply only to falsy items', function(done) {
			var f = control('draft').on(inc).on(inc).off(inc),
				next = after(2, done);

			f({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false, i:1});
				next();
			});
			f({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i:2});
				next();
			});
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop').off(inc), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft');
			assert.equal(f, f.off(inc));
		});
	});
});