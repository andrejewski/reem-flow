
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

describe('Within', function() {
	var control = flow.within.bind(flow);
	describe('#constructor()', function() {
		var	noop = function() {
				return {
					name: 'noop',
					list: {draft: false}
				}
			},
			toop = function() {
				return {
					name: 'toop',
					list: {draft: true}
				}
			},
			boop = function() {
				return {
					name: 'boop',
					list: {
						list: {draft: true}
					}
				}
			};

		it('should accept a filter function', function(done) {
			var f = control(function(item) {
					return item.draft;
				}).use(inc),
				next = after(3, done);

			f(noop(), {}, function(error, item) {
				assert.deepEqual(item, noop());
				next();
			});
			f(toop(), {}, function(error, item) {
				var res = toop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
			f(boop(), {}, function(error, item) {
				var res = boop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
		});

		it('should accept a matching object', function(done) {
			// see Underscore 1.6.0 `matches` function
			// http://underscorejs.org/#matches

			var f = control({draft: true}).use(inc),
				next = after(3, done);

			f(noop(), {}, function(error, item) {
				assert.deepEqual(item, noop());
				next();
			});
			f(toop(), {}, function(error, item) {
				var res = toop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
			f(boop(), {}, function(error, item) {
				var res = boop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
		});

		it('should accept an object property', function(done) {
			var f = control('draft').use(inc),
				next = after(3, done);

			f(noop(), {}, function(error, item) {
				assert.deepEqual(item, noop());
				next();
			});
			f(toop(), {}, function(error, item) {
				var res = toop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
			f(boop(), {}, function(error, item) {
				var res = boop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
		});

		var nestedNoop = function() {
				return {
					name: 'nestedNoop',
					list: {
						nested: {draft: false}
					}
				};
			},
			nestedToop = function() {
				return {
					name: 'nestedToop',
					list: {
						nested: {draft: true}
					}
				};
			},
			nestedBoop = function() {
				return {
					name: 'nestedBoop',
					list: {
						list: {
							nested: {draft: true}
						}
					}
				};
			}

		it('should accept a dot-access object property String', function(done) {
			// "nested.property" => item[nested][property]

			var f = control('nested.draft').use(inc),
				next = after(3, done);

			f(nestedNoop(), {}, function(error, item) {
				assert.deepEqual(item, nestedNoop());
				next();
			});
			f(nestedToop(), {}, function(error, item) {
				var res = nestedToop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
			f(nestedBoop(), {}, function(error, item) {
				var res = nestedBoop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
		});

		it('should accept a object property and value', function(done) {
			var f = control('draft', true).use(inc),
				next = after(3, done);

			f(noop(), {}, function(error, item) {
				assert.deepEqual(item, noop());
				next();
			});
			f(toop(), {}, function(error, item) {
				var res = toop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
			f(boop(), {}, function(error, item) {
				var res = boop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
		});

		it('should accept a dot-access object property String and value', function(done) {
			// "nested.property" => item[nested][property]

			var f = control('nested.draft', true).use(inc),
				next = after(3, done);

			f(nestedNoop(), {}, function(error, item) {
				assert.deepEqual(item, nestedNoop());
				next();
			});
			f(nestedToop(), {}, function(error, item) {
				var res = nestedToop();
				res.i = 1;
				assert.deepEqual(item, res);
				next();
			});
			f(nestedBoop(), {}, function(error, item) {
				var res = nestedBoop();
				res.i = 1;
				assert.deepEqual(item, res);
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