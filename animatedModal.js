/**
 * animatedModal.js: Version 1.0
 * author: João Pereira | Jack Westbrook
 * website: http://www.joaopereira.pt
 * email: joaopereirawd@gmail.com | jack.westbrook@gmail.com
 * Licensed MIT
 *
 * Example:
	var opts = {
		modalTarget:'animatedModal', // the
		position:'fixed',
		width:'100%',
		height:'100%',
		top:'0px',
		left:'0px',
		zIndexIn: '9999',
		zIndexOut: '-9999',
		color: '#fff',
		opacityIn:'1',
		opacityOut:'0',
		animatedIn:'zoomIn',
		animatedOut:'zoomOut',
		animationDuration:'.6s',
		overflow:'auto',
		// Callbacks
		beforeOpen: function() {},
		afterOpen: function() {},
		beforeClose: function() {},
		afterClose: function() {}
	};
 */

// https://github.com/umdjs/umd/blob/master/amdWeb.js
(function(root, factory) {
	if (typeof define == 'function' && define.amd){
		define(factory); // AMD module
	} else {
		root.AnimatedModal = factory(); // Browser global
	}

} (this, function() {
	'use strict';

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
			if( el.style[a] !== undefined ){
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
	function css(el, prop) {
		for (var n in prop) {
			el.style[vendor(el, n) || n] = prop[n];
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
	 * Check if an element has a class
	 */
	function hasClass(el, className) {
		if (el.classList){
			el.classList.contains(className);
		} else {
			new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
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
				if (obj[n] === undefined) obj[n] = def[n];
			}
		}
		return obj;
	}

	var prefixes = 'webkit Moz ms O'.split(' '); // Vendor prefixes
	var animationSupport = getAnimationEvent();

	// Built-in defaults
	var defaults = {
		animatedIn: 'zoomIn',
		animatedOut: 'zoomOut',
		animationDuration: '.6s',
		closeBtn: '.close-modal',
		color: '#fff',
		height: '100%',
		left: '0px',
		modalTarget: 'animated-modal',
		opacityIn: '1',
		opacityOut: '0',
		overflow: 'auto',
		position: 'fixed',
		top: '0px',
		width: '100%',
		zIndexIn: '9999',
		zIndexOut: '-9999',
		// Callbacks
		beforeOpen: null,
		afterOpen: null,
		beforeClose: null,
		afterClose: null
	};

	/** AnimatedModal contructor */
	function AnimatedModal(options) {
		var self = this;
		self.opts = merge(options || {}, AnimatedModal.defaults, defaults);
		self.modal = document.getElementById(self.opts.modalTarget);
		addClass(self.modal, 'animated');

		self.modal.querySelector(self.opts.closeBtn).addEventListener('click', self.close.bind(self));

		css(self.modal, {
			'-moz-animation-duration': self.opts.animationDuration,
			'-ms-animation-duration': self.opts.animationDuration,
			'-webkit-animation-duration': self.opts.animationDuration,
			'animation-duration': self.opts.animationDuration,
			'background-color': self.opts.color,
			'height': self.opts.height,
			'left': self.opts.left,
			'opacity': self.opts.opacityOut,
			'overflow-y': self.opts.overflow,
			'position': self.opts.position,
			'top': self.opts.top,
			'width': self.opts.width,
			'z-index': self.opts.zIndexOut
		});
	}

	// Global defaults that override the built-ins:
	AnimatedModal.defaults = {};

	AnimatedModal.prototype.open = function() {
		var self = this;

		css(document.documentElement, {'overflow': 'hidden'});
		css(document.body, {'overflow': 'hidden'});

		if (hasClass(self.modal, self.opts.modalTarget+'-off')) {
			removeClass(self.modal, self.opts.animatedOut);
			removeClass(self.modal, self.opts.modalTarget+'-off');
			addClass(self.modal, self.opts.modalTarget+'-on');
		}

		if (hasClass(self.modal, self.opts.modalTarget+'-on')) {
			if (typeof self.opts.afterOpen == 'function') {
				self.opts.beforeOpen();
			}

			css(self.modal, {'opacity': self.opts.opacityIn, 'z-index': self.opts.zIndexIn});
			addClass(self.modal, this.opts.animatedIn);

			self.modal.addEventListener(animationSupport, function openAnim() {
				if (typeof self.opts.afterOpen == 'function') {
					self.opts.afterOpen();
				}
				self.modal.removeEventListener(animationSupport, openAnim);
			});
		}


		return self;
	};

	AnimatedModal.prototype.close = function() {
		var self = this;
		document.documentElement.removeAttribute('style');
		document.body.removeAttribute('style');

		if (typeof self.opts.afterOpen == 'function') {
			self.opts.beforeClose();
		}

		if (hasClass(self.modal, self.opts.modalTarget+'-on')) {
			removeClass(self.modal, self.opts.modalTarget+'-on');
			addClass(self.modal, self.opts.modalTarget+'-off');
		}

		if (hasClass(self.modal, self.opts.modalTarget+'-off')) {
			removeClass(self.modal, self.opts.animatedIn);
			addClass(self.modal, self.opts.animatedOut);

			self.modal.addEventListener(animationSupport, function closeAnim() {
				css(self.modal, {'z-index': self.opts.zIndexOut});

				if (typeof self.opts.afterOpen == 'function') {
					self.opts.afterClose();
				}

				self.modal.removeEventListener(animationSupport, closeAnim);
			});
		}

		return self;

	};


	return AnimatedModal;

}));
