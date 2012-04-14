## jQuery object bind plugin v0.4.0

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
The option `watchObject: true` activates the automatic form update with the objective to immediately push the value converted by `toModel` to the form field.
**Warning:** `watchObject: true` requires ES5 compatible browser.

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
			watchObject: true,
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
