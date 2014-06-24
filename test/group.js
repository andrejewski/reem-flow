
/*
	Group is really just Reem.Ware constructed with
	the Reem instance passed to Flow. For more 
	comprehensive tests of Ware, view the core 
	Reem project tests.
*/

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

describe("Group", function() {
	describe("#use()", function() {
		it('should be a no-op given no arguments', function() {
			var group = flow.group();
			assert.equal(group.plugs.length, 0);
			assert.equal(group.use().plugs.length, 0);
		});
		it('should return itself to be chain-able', function() {
			var group = flow.group();
			assert.equal(group, group);
			assert.equal(group, group.use());
			assert.equal(group, group.use().use());
		});
		it('should add one middleware given one function', function() {
			var group = flow.group();
			assert.equal(group.use(inc).plugs.length, 1);
			assert.equal(group.use(inc).plugs.length, 2);
		});
		it('should add x middleware given X function arguments', function() {
			assert.equal(flow.group().use(inc).plugs.length, 1);
			assert.equal(flow.group().use(inc, inc).plugs.length, 2);
			assert.equal(flow.group().use(inc, inc, inc).plugs.length, 3);
		});
		it('should add x middleware given X-length array of functions', function() {
			assert.equal(flow.group().use([inc]).plugs.length, 1);
			assert.equal(flow.group().use([inc, inc]).plugs.length, 2);
			assert.equal(flow.group().use([inc, inc, inc]).plugs.length, 3);
		});
		it('should add one middleware given another Group', function() {
			assert.equal(flow.group().use(flow.group()).plugs.length, 1);
		});
		it('should add one middleware given a Group interface', function() {
			assert.equal(flow.group().use({'run': inc}).plugs.length, 1);
		});
		it('should throw for non-(function, Group, Group interface) arguments', function() {
			assert.throws(function() {
				flow.group().use(8);
			}, Error);
			assert.throws(function() {
				flow.group().use('Kevin Spacey');
			}, Error);
			assert.throws(function() {
				flow.group().use({eric: 'cartman'});
			}, Error);
		});
	});
	describe("#run()", function() {
		it('should return itself to be chain-able', function() {
			var group = flow.group(),
				noop = function() {};
			assert.equal(group, group);
			assert.equal(group, group.run({}, {}, noop));
			assert.equal(group, group.run({}, {}, noop).run({}, {}, noop));
		});
		it('should pass item and context to each middleware', function(done) {
			var g = flow.group().use(inc, inc, function(item, context, next) {
				assert.deepEqual(item, {i:2});
				assert.deepEqual(context, {i:2});
				next(null, item);
				done();
			});
			g.run({}, {}, function(error, item) {});
		});
		it('should pass final item to callback', function(done) {
			var g = flow.group().use(inc, inc);
			g.run({}, {}, function(error, item) {
				assert.deepEqual(item, {i:2});
				done();
			});
		});
		it('should halt middleware execution on error', function(done) {
			var o = {n:0},
				e = new Error('test'),
				g = flow.group().use(inc, function(_, _, next) {
					next(e);
				}, inc);
			g.run(o, {}, function(error) {
				assert.equal(error, e);
				assert.deepEqual(o, {n:0, i:1});
				done();
			});
		});
		it('should execute function middleware properly', function(done) {
			var g = flow.group().use(inc);
			g.run({}, {}, function(error, item) {
				assert.deepEqual(item, {i:1});
				done();
			});
		});
		it('should execute Group middleware properly', function(done) {
			var g = flow.group().use(flow.group().use(inc));
			g.run({}, {}, function(error, item) {
				assert.deepEqual(item, {i:1});
				done();
			});
		});
		it('should execute Group interface middleware properly', function(done) {
			var g = flow.group().use({'run': inc});
			g.run({}, {}, function(error, item) {
				assert.deepEqual(item, {i:1});
				done();
			});
		});
	});
});


