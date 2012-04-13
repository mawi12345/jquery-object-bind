/*!
* jQuery Object bind v0.1
*
* Copyright Martin Wind.
* Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function( $, undefined ){
	
    /* 
     * gets an converter by his namespace
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
     * recursive visit function
     * visits all propertys of an object
     * 
     * model: the object
     * target: the DOM Element (form)
     * options: supplied options element
     * object: the subject under observation 
     *         if undefined the model is used
     * namesapce: the current namespace (array)
	 */
	function visit(model, target, options, object, namespace) {
		
		if (typeof namespace == 'undefined') namespace = new Array();
		if (typeof object == 'undefined') object = model;
		$.each(object, function(key, value) {
			// ignore propertys and methods that start with '_'
			if (key.substr(0,1) == '_') return;
			// is an object or array
    		if ($.isPlainObject(value) || $.isArray(value)) {
    			var n = namespace.slice();
    			n.push(key);
    			// recursive call visit with new subject under observation 
    			// and the new namespace
    			visit(model,target, options, value, n);
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
    			// get the namespace as string, the DOM element and the converter
    			var nss = options.namespaceToString(ns);
    			var el = target.find(options.selector.replace(/%/g, nss));
    			var c = getConverterByNamespace(ns, options.converter);
    			// set the value of DOM element
    			el.val(c.toView(value));
    			if (options.watchTarget) {
    				// listen for change events and call setValueByNamespace
	    			el.bind('change', function(){
	    				setValueByNamespace(model, ns, c.toModel( $(this).val() ) );
	    			});
    			}
    			if (options.watchObject) {
    				// add an property change listener
    				object.watch(key, function (key, oldval, newval) {
    					$.each(model._targets, function(index, target){
    						// get the target options
    						var options = target.data('bind-object-options');
    						// find the target DOM element using the target options
    						var el = target.find(options.selector.replace(/%/g, nss));
    						// get converter using the target options
    						var c = getConverterByNamespace(ns, options.converter);
    						// set DOM elemet value
    						el.val(c.toView(newval));
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
        	//defaults
        	var defaults = { 
        		// converter functions
        		converter: {},
        		// update object on target changes
        		watchTarget: true,
        		// update target on object changes
        		watchObject: false,
        		// selcetor to find the form fields
        		// % will be replaced by namespaceToString return value
        		selector: '[name="%"]',
        		namespaceToString: function(ns){
        			return ns.join('-');
        		}
        	}; 
        	var options = $.extend({}, defaults, options); 
        	var target = $(this);
        	// store the options in the target
        	target.data('bind-object-options', options);
        	if (options.watchObject) {
	        	// add the target to the object _targets array
	        	if ($.isArray(object._targets)) {
	        		object._targets.push(target);
	        	} else {
	        		object._targets = [target];
	        	}
        	}
        	// visit all properties
        	visit(object, target, options);
        }
    }); 
	
})(jQuery);