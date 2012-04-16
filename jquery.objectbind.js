/*!
 * jQuery Object bind v0.5.1
 *
 * Copyright Martin Wind.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function( $, undefined ){
	
	var optionsKey = 'bind-object-options';
	var eventNamespace = '.bindobject';
	
	/* 
	 * gets an converter by namespace
	 * if no converter is found an pass-through convert is returned
	 */
	function getConverterByNamespace(namespace, converters) {
		var n = namespace.slice();
		var c = converters;
		while (n.length > 0) {
			var k = n.shift();
			if ($.isPlainObject(c[k])) {
				c = c[k];
			} else {
				break;
			}
		}
		if ($.isPlainObject( c ) && $.isFunction( c.toModel ) && $.isFunction( c.toView )) {
			return c;
		} 
		return {
			toView: function(value) {
				return value;
			},
			toModel: function(value) {
				return value;
			}
		};
	}
	
	/* 
	 * recursive unbind function
	 * unwatch all properties of an object
	 */
	function unbind(object) {
		$.each(object, function(key, value) {
			// ignore properties and methods that start with '_'
			if (key.substr(0,1) == '_') return;
    		if ($.isPlainObject(value) || $.isArray(value)) {
    			// recursive call visit with new subject under observation 
    			unbind(value);
    		} else if (!$.isFunction(value)) {
    			object.unwatch(key);
    		}
		});
	}
	
	/* 
	 * recursive visit function
	 * visits all properties of an object
	 * 
	 * model: the object
	 * container: the DOM Element
	 * options: supplied options element
	 * object: the subject under observation 
	 *         if undefined the model is used
	 * namesapce: the current namespace (array)
	 */
	function visit(model, container, options, object, namespace) {
		
		if (namespace == undefined) namespace = new Array();
		if (object == undefined) object = model;
		$.each(object, function(key, value) {
			// ignore properties and methods that start with '_'
			if (key.substr(0,1) == '_') return;
			// is an object or array
    		if ($.isPlainObject(value) || $.isArray(value)) {
    			var n = namespace.slice();
    			n.push(key);
    			// recursive call visit with new subject under observation 
    			// and the new namespace
    			visit(model, container, options, value, n);
    		// is function or property
    		} else {
    			// copy namespace and add the key
    			var ns = namespace.slice();
    			ns.push(key);
    			// if value is an function use the return value
    			if ($.isFunction(value)) {
    				// call the function with "this" as the model
    				value =  $.proxy(value, model)();
    			}    			
    			
    			var el = container.find(options.selector(ns));
    			var c = getConverterByNamespace(ns, options.converter);
    			
    			// set the value of DOM element by accessFn
    			el[options.accessFn](c.toView(value));
    			if (options.watchTarget) {
    				// listen for change events and call setValueByNamespace
	    			el.on('change'+eventNamespace, function(){
	    				var modelVal = c.toModel( $(this)[options.accessFn]() );
	    				setValueByNamespace(model, ns,  modelVal );
	    				// if options.watchObject is true the value will automatically set by
	    				// the watch handler to c.toView
	    				if (options.convertBackOnChange && !options.watchObject) {
	    					$(this)[options.accessFn]( c.toView( modelVal ) );
	    				}
	    			});
    			}
    			if (options.watchObject) {
    				// add an property change listener
    				object.watch(key, function (key, oldval, newval) {
    					$.each(model._containers, function(index, container){
    						var options = container.data(optionsKey);
       						var el = container.find(options.selector(ns));
    						var c = getConverterByNamespace(ns, options.converter);
    						// set the value of DOM element by accessFn
    						el[options.accessFn](c.toView(newval));
    					});
    					// return the new value
    					// see: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/watch
    					return newval;
    				});
    			}
    		}
		});
	}
	
	/* 
	 * sets an value on the model using the value namespace
	 * 
	 * model: the object
	 * namesapce: the namespace (array)
	 * value: the new value
	 */
	function setValueByNamespace(model, namespace, value) {
    	var ns = namespace.slice();
    	var s = model;
    	// find the innermost object
    	while (ns.length > 1) {
    		s = s[ns.shift()];
    	}
    	var k = ns.shift();
    	if ($.isFunction(s[k])) {
    		// call the function with "this" as the model
    		$.proxy(s[k], model)(value);
    	} else {
    		s[k] = value;
    	}
    }

    $.fn.extend({
        bindObject: function (object, options) {
        	var container = $(this);
        	//defaults
        	var defaults = { 
        		// converter functions
        		converter: {},
        		// update object on target changes
        		watchTarget: true,
        		// update target on object changes
        		watchObject: false,
        		// push the value from 'toView' to the element on change
        		convertBackOnChange: true,
        		// selector to find the form fields by namespace
        		selector: function(ns){
        			return '[name="'+ns.join('-')+'"]';
        		},
        		accessFn: 'val'
        	};
        	var shortcut;
        	if (typeof options == 'string') {
        		shortcut = options;
        		options = $.extend({}, container.data(optionsKey));
        		if (shortcut == 'update') {
        			options.watchTarget = false;
        			options.watchObject = false;	
        		} else if (shortcut == 'unbind') {
        			// unbind event namespace
        			container.off(eventNamespace);
        			// remove container from object._containers
        			object._containers = $.grep(object._containers, function(value) {
        				return !value.is(container);
        			});
        			if (object._containers.length == 0) {
        				delete object[_containers];
        				unbind(object);
        			}
        			return container;
        		}
        	}
        	var options = $.extend({}, defaults, options);
        	if (shortcut == undefined) {
	        	// store the options in the container
	        	container.data(optionsKey, options);
	        	// add the container to the object _containers array
	        	if ($.isArray(object._containers)) {
	        		object._containers.push(container);
	        	} else {
	        		object._containers = [container];
	        	}
        	}
        	// visit all properties
        	visit(object, container, options);
        	// return container for chaining
        	return container;
        }
    }); 
})(jQuery);
