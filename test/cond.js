
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

describe('Cond', function() {
	var control = flow.cond.bind(flow);
	describe('#constructor()', function() {

		it('should accept a filter function', function(done) {
			var f = control(function(item) {
					return item.draft;
				})
				.when(true).use(inc, inc)
				.otherwise(inc),
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

		it('should accept a matching object', function(done) {
			// see Underscore 1.6.0 `matches` function
			// http://underscorejs.org/#matches

			var f = control({draft: true})
				.when(true).use(inc, inc)
				.otherwise(inc),
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

		it('should accept an object property', function(done) {
			var f = control('draft')
				.when(true).use(inc, inc)
				.otherwise(inc),
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

		it('should accept a dot-access object property String', function(done) {
			// "nested.property" => item[nested][property]

			var f = control('nested.draft')
				.when(true).use(inc, inc)
				.otherwise(inc),
				next = after(2, done);

			f({nested: {draft: false}}, {}, function(error, item) {
				assert.deepEqual(item, {nested: {draft: false}, i:1});
				next();
			});
			f({nested: {draft: true}}, {}, function(error, item) {
				assert.deepEqual(item, {nested: {draft: true}, i:2});
				next();
			});
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop'), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft');
			assert.equal(f, f.when().otherwise().use(inc));
		});

	});
	describe('#when()', function() {
		it('should throw if called after #otherwise()', function() {
			assert.throws(function() {
				control('draft').otherwise(inc).when().use(inc);
			}, Error);
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop').when('value'), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft').when('value');
			assert.equal(f, f.use(inc));
		});
	});
	describe('#otherwise()', function() {
		it('should add middleware like use', function(done) {
			var c = control('draft').otherwise(inc),
				next = after(2, done);
			c({draft: false}, {}, function(error, item) {
				assert.deepEqual(item, {draft: false, i: 1});
				next();
			});
			c({draft: true}, {}, function(error, item) {
				assert.deepEqual(item, {draft: true, i: 1});
				next();
			});
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop').otherwise(), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft').otherwise();
			assert.equal(f, f.use(inc));
		});
	});
	describe('#use()', function() {
		it('should throw if called before a #when()/#otherwise()', function() {
			assert.throws(function() {
				control('draft').use(inc);
			}, Error);
		});

		it('should return a plugin function', function() {
			assert.equal(typeof control('prop').otherwise().use(), 'function');
		});

		it('should be chain-able', function() {
			var f = control('draft').otherwise().use();
			assert.equal(f, f.use(inc));
		});
	});
});

