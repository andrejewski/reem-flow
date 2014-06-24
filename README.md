reem-flow
===

Middleware flow controls for Reem.

## Installation

```bash
npm install reem-flow # --save for projects
```

## Usage

```javascript
var flow = require('reem-flow'),
	FlowClass = flow.Flow,
// see "controls" for use cases
```

## About

`reem-flow` is a plugin for [Reem](https://github.com/andrejewski/reem) that simplifies the process of adding middleware to Reem. The whole idea is a way to combine middleware which should work only under certain conditions and `reem-flow` provides functions for that task. Each flow control returns a Reem compatible plugin so controls can be nested if the logic sees fit.

## Controls

This plugin comes with only a few controls, but alone or combined they are still pretty powerful and feature rich.

### cond

Cond (conditional/switch) is an adaption of JavaScript's own conditional switch made for Reem plugins. Instead of reserved words switch, case, and default, here we uses cond, when, and otherwise respectively. Breaks are automatically called once a `when` clause is met, falling back to the `otherwise` clause if none are met.

```javascript
flow.cond('basename')
	.when('source')
		.use(plugin)
		.use(plugin)
	.when('assets')
		.use([plugins])
	.otherwise()
		.use(plugin);
```

`Flow.cond (prop Function(item Reem.Item) Any) Plugin`
The method takes a function, passes that function the current item, and uses the result to compare with any `when` clauses. If the comparison yields true, the included plugins execute.

`Flow.cond (prop String) Plugin`
If a String is passed, `cond` will use the item's value at that property name. If the String has access dots (`nested.prop`), `item[nested][prop]` will be used as you would expect.

`Flow.cond (prop Any) Plugin`
This will use the plain value at `item[prop]`.

#### when clause

The when clauses enqueue (Array::push) so be careful not to pass the same condition to different clauses and expect them to be grouped. The `when` clause accepts different type signatures.

`when (value Function(prop Any) Boolean) Plugin`
If given a function, the value of cond's argument given the item is passed to this function. If this function returns true, the middleware is executed on that item and `cond` stops cascading down remaining clauses.

`when (value Any) Plugin`
Any value to compare to the value returned by the `cond` argument.

#### otherwise clause

Once the otherwise clause is called, no more when clauses can be added and any call of `use` is attached to otherwise. Otherwise wraps `use` so plugins passed to `otherwise` will work as expected.

### filter

Filter is simple. If the given function applied to a given item returns true, the plugins are executed on the item.

```javascript
var filter = flow.filter(function(item) {
	return item.ignore;
}).use(This).use(That).use(TheOtherThing);
```

### group

Group is a function taking no arguments that returns essentially a control plugin without any conditional logic. This would be used to group plugins and serve as a building block to other controls if desired.

```javascript
var stack = flow.group()
	.use(thisSpecificallyFirst)
	.use(thatSpecificallySecond)
```

### within

This control handles the case of where plugins should only apply if the item is within the given list. "Within" does not mean "within the immediate list." If any of the parent lists match, the item is run through the plugins all the same.

```javascript
var inBlog = flow.within(BlogList),
	inAssets = flow.within(function(list) {
		return list.filename === 'assets';
	});
```

`Flow.within (list Reem.List) Plugin`
The item must be within the given list for its plugin to execute. This uses `===` to compare the list to lists containing the item. This will override the standard type signatures this function shares with `filter` and `toggle` if the conditions are met.

### toggle

This control is like filter but partitions items by whether the given function yields true or false. Both values have their own middleware stacks. The plugin uses, instead of `use`, `yes` and `no` (and `yay` and `nay`) chain-able calls to add plugins to the two separate stacks.

```javascript
var isDraft = flow.toggle('draft')
	.yes(yayIsADraft)
	.no(booNotADraft)
	.yay(yesIsADraft)
	.nay(noNotADraft)
```

### Standard Control Interface

The `filter`, `within`, and `toggle` methods all have the same overloaded type signatures. They all result in a filter function that accepts an Reem.Item and returns a Boolean. 

```javascript
// All of these are equivalent
Flow.method(function(item) {
	return item.draft === true;
});
Flow.method({draft: true});
Flow.method("draft");
Flow.method("draft", true);
```

The type signatures below are checked for in order.

`Flow.method (Function(item Reem.Item) Boolean) Plugin`
Plain filter function, no coercion here.

`Flow.method (obj Object) Plugin`
Shorthand for a variation of [Underscore's `matches`](http://underscorejs.org/#matches). Similar to `_.matches(obj)(item)`.

`Flow.method (prop Any) Plugin`
Shorthand for `!!item[prop]`.

`Flow.method (prop Any, value Any) Plugin`
Shorthand for `item[prop] === value`.

If the property name is a String and has access dots (`nested.prop`), these methods will use `item[nested][prop]` as you would expect.

## Classes

### Flow
This is just a simple class that contains all the control functions. None of the control functions rely on being part of a class, it is just for convenience.

This class is accessible via `require('reem-flow').Flow`.

### Plugin
Technically not a class, but an interface. Most controls return plugins which have only the `use` function. `cond` and `toggle` are the exceptions. The plugin itself is a function that can be passed to Reem or another control.

## Contributing

If you have an issue or find a bug open an issue and I will see what we can do. If you can fix the bug yourself, by all means send a pull request for consideration.

Until `reem` and `reem-flow` hit v1, I would like to keep backwards compatibility with the v0.0.1, treating it like v1. When the conditions are met for v1, we can cut away the cruft of v0.

```bash
# running tests
npm run test
npm run test-spec
```

