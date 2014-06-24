
function Flow(reem) {
	if(!(this instanceof Flow)) return new Flow(reem);
	this.Ware = reem.ware;
}

Flow.prototype.group = function() {
	return this.Ware();
}

Flow.prototype.filter = function(a,b) {
	var middle = this.group(),
		filter = compare(a,b);
	function plugin(item, context, next) {
		if(!filter(item)) return next(null, item);
		middle.run(item, context, next);
	}
	plugin.use = chain(plugin, middle.use);
	return plugin;
}

Flow.prototype.within = function(a,b) {
	var middle = this.group(),
		within = climb(compare(a,b));
	function plugin(item, context, next) {
		if(!within(item.list)) return next(null, item);
		middle.run(item, context, next);
	}
	plugin.use = chain(plugin, middle.use);
	return plugin;

	function climb(fx) {
		return function step(list) {
			if(!list) return false;
			return fx(list) || step(list.list);
		}
	}
}

Flow.prototype.toggle = function(a,b) {
	var middleOn = this.group(),
		middleOff = this.group(),
		predicate = compare(a,b);
	function plugin(item, context, next) {
		if(!predicate(item)) return middleOff.run(item, context, next);
		middleOn.run(item, context, next);
	}
	var c = chain.bind(null, plugin);
	plugin.on = c(middleOn.use);
	plugin.off = c(middleOff.use);
	return plugin;
}

Flow.prototype.cond = function(a) {
	var val = compare(a),
		ware = this.group.bind(this),
		otherwiseMode = false,
		otherwiseWare = ware(),
		conds = []; // [cmp Function, ware Ware]

	function plugin(item, context, next) {
		var found = false,
			value = val(item);
		conds.forEach(function(cond) {
			var cmp = cond[0],
				ware = cond[1];
			if(found) return;
			if(!(found = cmp(value))) return;
			ware.run(item, context, next);
		});
		if(!found) otherwiseWare.run(item, context, next);
	}

	var c = chain.bind(null, plugin);
	plugin.when = c(function(cmp) {
		if(otherwiseMode) {
			throw new Error("`when` cannot be called after `otherwise`.");
		}
		conds.push([typeof cmp !== 'function'
			? function(x) {return cmp === x;}
			: cmp, ware()]);
	});

	plugin.otherwise = c(function() {
		otherwiseMode = true;
		if(arguments.length) plugin.use.apply(null, arguments);
	});

	plugin.use = c(function() {
		var middle = (otherwiseMode 
			? otherwiseWare
			: (conds[conds.length - 1] || [])[1])
		if(!middle) throw new Error("No when/otherwise clause supplied.");
		middle.use.apply(null, arguments);
	});
	return plugin;
}

function chain(obj, method) {
	return function() {
		method.apply(null, arguments);
		return obj;
	}
}

function compare(prop, value) {
	if(typeof prop === 'function') return prop;
	if(typeof value === 'undefined') {
		if(typeof prop === 'object') {
			return where(prop);
		}
		return function(item) {
			return access(item, prop);
		}
	}
	return function(item) {
		return access(item, prop) === value;
	}
}

function access(obj, prop) {
	if(typeof prop !== 'string') return obj[prop];
	var sprop = prop.split('.');
	if(sprop.length === 1) return obj[prop];
	return access(obj[sprop.shift()] || {}, sprop.join('.'));
}

function where(obj) {
	var tests = [];
	for(key in obj) {
		if(obj.hasOwnProperty(key)) tests.push([key, obj[key]]);
	}
	return function(f) {
		return !tests.reduce(function(s, test) {
			return s || access(f, test[0]) !== test[1];
		}, false);
	}
}

module.exports = Flow;
