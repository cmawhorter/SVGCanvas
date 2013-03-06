// These pulled from MochiKit (except where noted) to support the bare functions needed 
// https://github.com/mochi/mochikit
// License (MIT): https://github.com/mochi/mochikit/blob/master/LICENSE.txt

module.exports = function (window, document) {
	var MochiKit = {
		Base: {
			camelize: function (selector) {
	        /* from dojo.style.toCamelCase */
	        var arr = selector.split('-');
	        var cc = arr[0];
	        for (var i = 1; i < arr.length; i++) {
	            cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
	        }
	        return cc;
	    },

			isUndefinedOrNull: function (/* ... */) {
	        for (var i = 0; i < arguments.length; i++) {
	            var o = arguments[i];
	            if (!(typeof(o) == 'undefined' || o === null)) {
	                return false;
	            }
	        }
	        return true;
	    },

			concat: function (/* lst... */) {
	        var rval = [];
	        var extend = MochiKit.Base.extend;
	        for (var i = 0; i < arguments.length; i++) {
	            extend(rval, arguments[i]);
	        }
	        return rval;
	    },

	    // Derived
			extend: function (self, obj, /* optional */skip) {
	        // Extend an array with an array-like object starting
	        // from the skip index
	        if (!skip) {
	            skip = 0;
	        }
	        if (obj) {
	            // allow iterable fall-through, but skip the full isArrayLike
	            // check for speed, this is called often.
	            var l = obj.length;
	            if (!self) {
	                self = [];
	            }
	            for (var i = skip; i < l; i++) {
	                self.push(obj[i]);
	            }
	        }
	        // This mutates, but it's convenient to return because
	        // it's often used like a constructor when turning some
	        // ghetto array-like to a real array
	        return self;
	    },

			nameFunctions: function (namespace) {
	        var base = namespace.NAME;
	        if (typeof(base) == 'undefined') {
	            base = '';
	        } else {
	            base = base + '.';
	        }
	        for (var name in namespace) {
	            var o = namespace[name];
	            if (typeof(o) == 'function' && typeof(o.NAME) == 'undefined') {
	                try {
	                    o.NAME = base + name;
	                } catch (e) {
	                    // pass
	                }
	            }
	        }
	    },

	    // Derived from MochiKit
	    bind: function (func, self/* args... */) {
	        if (typeof(func) == "string") {
	            func = self[func];
	        }
	        var im_func = func.im_func;
	        var im_preargs = func.im_preargs;
	        var im_self = func.im_self;
	        var m = MochiKit.Base;
	        if (typeof(im_func) != 'function') {
	            im_func = func;
	        }
	        if (typeof(self) != 'undefined') {
	            im_self = self;
	        }
	        if (typeof(im_preargs) == 'undefined') {
	            im_preargs = [];
	        } else  {
	            im_preargs = im_preargs.slice();
	        }
	        m.extend(im_preargs, arguments, 2);
	        var newfunc = function () {
	            var args = arguments;
	            var me = arguments.callee;
	            if (me.im_preargs.length > 0) {
	                args = m.concat(me.im_preargs, args);
	            }
	            var self = me.im_self;
	            if (!self) {
	                self = this;
	            }
	            return me.im_func.apply(self, args);
	        };
	        newfunc.im_self = im_self;
	        newfunc.im_func = im_func;
	        newfunc.im_preargs = im_preargs;
	        if (typeof(im_func.NAME) == 'string') {
	            newfunc.NAME = "bind(" + im_func.NAME + ",...)";
	        }
	        return newfunc;
	    },

			partial: function (func) {
	        var m = MochiKit.Base;
	        return m.bind.apply(this, m.extend([func, undefined], arguments, 1));
	    },

			updatetree: function (self, obj/*, ...*/) {
	        if (self === null || self === undefined) {
	            self = {};
	        }
	        for (var i = 1; i < arguments.length; i++) {
	            var o = arguments[i];
	            if (typeof(o) != 'undefined' && o !== null) {
	                for (var k in o) {
	                    var v = o[k];
	                    if (typeof(self[k]) == 'object' && typeof(v) == 'object') {
	                        arguments.callee(self[k], v);
	                    } else {
	                        self[k] = v;
	                    }
	                }
	            }
	        }
	        return self;
	    }
		},

		DOM: {
			// Derived
			createDOM: function (name, attrs/*, nodes... */) {
	        var elem;
	        var self = MochiKit.DOM;
	        var m = MochiKit.Base;
	        if (typeof(attrs) == "string" || typeof(attrs) == "number") {
	            var args = m.extend([name, null], arguments, 1);
	            return arguments.callee.apply(this, args);
	        }
	        if (typeof(name) == 'string') {
	            var d = document;
              elem = d.createElement(name);
	        } else {
	            elem = name;
	        }
	        if (attrs) {
	            self.updateNodeAttributes(elem, attrs);
	        }
	        if (arguments.length <= 2) {
	            return elem;
	        } else {
	            var args = m.extend([elem], arguments, 2);
	            return self.appendChildNodes.apply(this, args);
	        }
	    },

			// Derived from MochiKit
			appendChildNodes: function (node/*, nodes...*/) {
	        var elem = node;
	        var self = MochiKit.DOM;
	        if (typeof(node) == 'string') {
	            elem = self.getElement(node);
	        }
	        var nodeStack = [
	            Array.prototype.slice.call(arguments)
	        ];
	        var concat = MochiKit.Base.concat;
	        while (nodeStack.length) {
	            var n = nodeStack.shift();
	            if (typeof(n) == 'undefined' || n === null) {
	                // pass
	            } else if (typeof(n.nodeType) == 'number') {
	                elem.appendChild(n);
	            } else {
	                nodeStack = concat(n, nodeStack);
	            }
	        }
	        return elem;
	    },

			// Derived from MochiKit
			attributeArray: function(node) {
				// Was for IE support, not needed here
				return node.attributes;
			},

			// Derived from MochiKit
			updateNodeAttributes: function(node, attrs) {
				var elem = node;
        var self = MochiKit.DOM;
        var base = MochiKit.Base;
        if (typeof(node) == 'string') {
            elem = self.getElement(node);
        }
        if (attrs) {
            // not IE, good.
            for (var k in attrs) {
                var v = attrs[k];
                if (typeof(v) == 'object' && typeof(elem[k]) == 'object') {
                    if (k == "style" && MochiKit.Style) {
                        MochiKit.Style.setStyle(elem, v);
                    } else {
                        base.updatetree(elem[k], v);
                    }
                } else if (k.substring(0, 2) == "on") {
                    if (typeof(v) == "string") {
                        v = new Function(v);
                    }
                    elem[k] = v;
                } else {
                    elem.setAttribute(k, v);
                }
            }
        }
        return elem;
			},

			// Not sure how safe this is... FIXME: Replace with something more standard ... ?
			escapeHTML: function (s) {
	        return s.replace(/&/g, "&amp;"
	            ).replace(/"/g, "&quot;"
	            ).replace(/</g, "&lt;"
	            ).replace(/>/g, "&gt;");
	    },

			// Derived from MochiKit
			getElement: function (id) {
	        if (arguments.length == 1) {
	            return ((typeof(id) == "string") ?
	                document.getElementById(id) : id);
	        } else {
	        		var els = [];
	        		Array.prototype.slice.call(arguments).forEach(function(arg) {
	        			els.push(MochiKit.DOM.getElement(arg));
	        		});
	            return els;
	        }
	    },

			replaceChildNodes: function (node/*, nodes...*/) {
	        var elem = node;
	        var self = MochiKit.DOM;
	        if (typeof(node) == 'string') {
	            elem = self.getElement(node);
	            arguments[0] = elem;
	        }
	        var child;
	        while ((child = elem.firstChild)) {
	            elem.removeChild(child);
	        }
	        if (arguments.length < 2) {
	            return elem;
	        } else {
	            return self.appendChildNodes.apply(this, arguments);
	        }
	    }
		},

		Style: {
			// Derived from MochiKit
			setStyle: function (elem, style) {
        elem = MochiKit.DOM.getElement(elem);
        for (var name in style) {
            elem.style[MochiKit.Base.camelize(name)] = style[name];
        }
      }
		}
	};

	return MochiKit;
}