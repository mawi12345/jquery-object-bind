## jQuery object bind plugin v0.3.0

The plugin allows you to link fields of a form to an object.

It's inspired by [jquery-datalink](https://github.com/jquery/jquery-datalink).

Any changes to the form fields are automatically pushed onto the object, saving you from writing retrieval code. 
By default, changes to the object aren't pushed back onto the corresponding form field.
You could enable automatic form upadte, but this feature required the non-standard `Object.watch` methods witch is only implemented in Gecko.
Eli Grey has developed an [Polyfill](https://gist.github.com/384583) that offers watch to all ES5 compatible browser.

Furthermore, converters lets you modify the format or type of the value as it flows between the two sides.

This plugin uses [Semantic Versioning](http://semver.org/).

### Example

	<script type="text/javascript">
	$(function(){
		user = {
			id: 1213,
			name: {
				first: 'Franz',
				last: 'Smith'
			},
			level: 34
		}
		$('#user-edit-form').bindObject(user);
		
	});
	</script>
	<form id="user-edit-form">
		<input name="id" />
		<input name="name-first" />
		<input name="name-last" />
		<input name="level" />
	</form>