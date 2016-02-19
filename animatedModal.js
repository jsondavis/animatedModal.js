/**
 * animatedModal.js: Version 1.0
 * author: João Pereira | Jack Westbrook
 * website: http://www.joaopereira.pt
 * email: joaopereirawd@gmail.com | jack.westbrook@gmail.com
 * Licensed MIT
 *
 * Example:
	var opts = {
		animatedIn: 'zoomIn',
		animatedOut: 'zoomOut',
		closeBtn: '.close-modal',
		modalBaseClass: 'animated-modal',
		modalTarget: 'animated-modal',
		// Callbacks
		escClose: null,
		afterClose: null,
		afterOpen: null,
		beforeClose: null,
		beforeOpen: null
	};
 */

// https://github.com/umdjs/umd/blob/master/amdWeb.js
(function(root, factory) {
	if (typeof define === 'function' && define.amd){
		define(factory); // AMD module
	} else {
		root.AnimatedModal = factory(); // Browser global
	}

} (this, function() {
	'use strict';

	var prefixes = 'webkit Moz ms O'.split(' '); // Vendor prefixes
	var animationSupport = getAnimationEvent();

	// Built-in defaults
	var defaults = {
		animatedIn: 'zoomIn',
		animatedOut: 'zoomOut',
		closeBtn: '.close-modal',
		modalBaseClass: 'animated-modal',
		modalTarget: 'animated-modal',
		// Callbacks
		escClose: null,
		afterClose: null,
		afterOpen: null,
		beforeClose: null,
		beforeOpen: null
	};

	/**
	 * Gets the animation end event name to use
	 */
	function getAnimationEvent() {
		var a,
			el = document.createElement('fakeelement'),
			animations = {
				'animation': 'animationend',
				'OAnimation': 'oAnimationEnd',
				'MozAnimation': 'animationend',
				'WebkitAnimation': 'webkitAnimationEnd'
			};

		for(a in animations){
			if(el.style[a] !== undefined) {
				return animations[a];
			}
		}
	}

	/**
	 * Tries various vendor prefixes and returns the first supported property.
	 */
	function vendor(el, prop) {
		var s = el.style;
		var pp;
		var i;

		prop = prop.charAt(0).toUpperCase() + prop.slice(1);
		if (s[prop] !== undefined) {
			return prop;
		}
		for (i = 0; i < prefixes.length; i++) {
			pp = prefixes[i]+prop;
			if (s[pp] !== undefined) {
				return pp;
			}
		}
	}

	/**
	 * Sets multiple style properties at once.
	 */
	function css(el, styles) {
		for (var prop in styles) {
			if (styles.hasOwnProperty(prop)) {
				el.style[vendor(el, prop) || prop] = styles[prop];
			}
		}

		return el;
	}

	/**
	 * Adds a class to an element
	 */
	function addClass(el, className) {
		if (el.classList) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}

		return el;
	}

	/**
	 * Remove a class from an element
	 */
	function removeClass(el, className) {
		if (el.classList) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	/**
	 * Fills in default values.
	 */
	function merge(obj) {
		for (var i = 1; i < arguments.length; i++) {
			var def = arguments[i];
			for (var n in def) {
				if (obj[n] === undefined) {
					obj[n] = def[n];
				}
			}
		}
		return obj;
	}

	/** AnimatedModal contructor */
	function AnimatedModal(options) {
		var self = this;
		self.opts = merge(options || {}, AnimatedModal.defaults, defaults);
		self.modal = (typeof self.opts.modalTarget === 'object') ? self.opts.modalTarget : document.getElementById(self.opts.modalTarget);
		self.isOpen = false;

		if (self.opts.closeBtn) {
			self.modal.querySelector(self.opts.closeBtn).addEventListener('click', self.close.bind(self));
		}
	}

	// Global defaults that override the built-ins:
	AnimatedModal.defaults = {};

	AnimatedModal.prototype.open = function() {
		var self = this;
		if (self.isOpen) {return;}

		css(document.documentElement, {'overflow': 'hidden'});
		css(document.body, {'overflow': 'hidden'});

		removeClass(self.modal, self.opts.animatedOut);
		addClass(self.modal, self.opts.modalBaseClass+'-on');
		addClass(self.modal, this.opts.animatedIn);

		if (typeof self.opts.beforeOpen === 'function') {
			self.opts.beforeOpen();
		}

		if (animationSupport) {

			self.modal.addEventListener(animationSupport, function openAnim() {
				if (typeof self.opts.afterOpen === 'function') {
					self.opts.afterOpen();
				}
				self.modal.removeEventListener(animationSupport, openAnim);
				self.isOpen = true;
				document.documentElement.addEventListener('keyup', function escClose(event) {
					var key = event.keyCode || event.which;
					if (key === 27) {
						if (typeof self.opts.escClose === 'function') {
							self.opts.escClose();
						}
						self.close(self);
						document.documentElement.removeEventListener('keyup', escClose);
					}
				});
			});

		} else {

			if (typeof self.opts.afterOpen === 'function') {
				self.opts.afterOpen();
			}

			self.isOpen = true;
			document.documentElement.addEventListener('keyup', function escClose(event) {
				var key = event.keyCode || event.which;
				if (key === 27) {
					if (typeof self.opts.escClose === 'function') {
						self.opts.escClose();
					}
					self.close(self);
					document.documentElement.removeEventListener('keyup', escClose);
				}
			});

		}

		return self;
	};

	AnimatedModal.prototype.close = function() {
		var self = this;
		if (!self.isOpen) {return;}
		document.documentElement.removeAttribute('style');
		document.body.removeAttribute('style');

		if (typeof self.opts.beforeClose === 'function') {
			self.opts.beforeClose();
		}

		removeClass(self.modal, self.opts.animatedIn);
		addClass(self.modal, self.opts.animatedOut);

		if (animationSupport) {
			self.modal.addEventListener(animationSupport, function closeAnim() {

				removeClass(self.modal, self.opts.modalBaseClass+'-on');

				if (typeof self.opts.afterClose === 'function') {
					self.opts.afterClose();
				}
				self.isOpen = false;
				self.modal.removeEventListener(animationSupport, closeAnim);
			});
		} else {

			removeClass(self.modal, self.opts.modalBaseClass+'-on');

			if (typeof self.opts.afterClose === 'function') {
				self.opts.afterClose();
			}
			self.isOpen = false;
		}

		return self;

	};

	return AnimatedModal;

}));
