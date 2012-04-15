## jQuery object bind plugin v0.5.0

The plugin allows you to link fields of a form to an object.

It's inspired by [jquery-datalink](https://github.com/jquery/jquery-datalink).

Requires jQuery 1.7+ (uses `on`, `off` and `is`)

Any changes to the form fields are automatically pushed onto the object, saving you from writing retrieval code. 
By default, changes to the object aren't pushed back onto the corresponding form field.
You could enable automatic form update, but this feature requires the non-standard `Object.watch` methods witch is only implemented in Gecko.
Eli Grey has developed an [Polyfill](https://gist.github.com/384583) that offers `Object.watch` to all ES5 compatible browser.

This plugin uses [Semantic Versioning](http://semver.org/).

### Features
*   Changes on form fields are automatically pushed onto the object.
*   Converters let you modify the format or type of the value as it flows between the two sides.
*   Custom selectors let you define witch form field is mapped to witch property
*   Supports nested objects.
*   Changes on the object are automatically pushed onto the form field. **Warning:** requires ES5 compatible browser.
*   Custom access function let you modify every type of element (not only form fields)
*   Of course it's possible to disconnect an bound object

### Non-goals
*   Create an object based on form data.

### Basic Example
Fills the form fields with object properties. The default selector function converts the nested object name to the selector `[name="<<object name>>-<<property name>>"]` for example on `user.name.first` becomes `[name="name-first"]`.
If the user changes any form field value the `user` object is automatically updated.

	<script type="text/javascript">
	$(function(){
		user = {
			id: 1213,
			name: {
				first: 'Franz',
				last: 'Smith'
			},
			level: 34
		};
		$('#user-edit-form').bindObject(user);
	});
	</script>
	<form id="user-edit-form">
		<input name="id" />
		<input name="name-first" />
		<input name="name-last" />
		<input name="level" />
	</form>

### Converter Example
This example shows the basic usage of an converter.
An converter consists of of an object of the two function `toView` and `toModel`.
`toView` converts the object property to the displayed value and `toModel` converts the user input the the stored value.
In this example `toView` only passes the object value to the form but `toModel` converts the input to first letter in upper case and the remaining letters to lower case.
The option `convertBackOnChange: true` activates the automatic form update with the objective to immediately push the value converted by `toModel` to the form field.

	<script type="text/javascript">
	$(function(){
		user = {
			id: 1213,
			name: {
				first: 'Franz',
				last: 'Smith'
			},
			level: 34
		};
		
		var options = {
			convertBackOnChange: true,
			converter: {
				name: {
					first: {
						toView: function(value) {
							return value;
						},
						toModel: function(value) {
							return value.substr(0,1).toUpperCase() + value.substr(1).toLowerCase();
						}
					}
				}
			}
		};
		
		$('#user-edit-form').bindObject(user, options);
	});
	</script>
	<form id="user-edit-form">
		<input name="id" />
		<input name="name-first" />
		<input name="name-last" />
		<input name="level" />
	</form>

### Selector Example
Some times the default selector dosn't fit to the requirements. This example shows how to use an different mapping selector and access function.
The option `selector` let you specify an function that converts the namespace array to an jQuery selector. 
The namespace array contains a object name chain of nested objects. 
For example the `user.id` property has the namespace `['id']` and the `user.name.first` property ['name', 'first']`.
The easiest way is to use the `Array.join` method to convert the array to string and then prefix it with `.` or `#`.
This example also shows how to use the `accessFn` option. `accessFn` is the method name called on the element to set and get his value.
jQuery provides `val` (the defaul value), `html` and `text`.

	<script type="text/javascript">
	$(function(){
		user = {
			id: 1213,
			name: {
				first: 'Franz',
				last: 'Smith'
			},
			level: 34
		};
		
		$('#html-test').bindObject(user, {
			accessFn: 'html',
    		selector: function(ns){
    			return '#'+ns.join('-');
    		}
		});
		
	});
	</script>
	<div id="html-test">
		<span id="id"></span> 
		<span id="name-first"></span> 
		<span id="name-last"></span>
		<span id="level"></span>
	</div>
	