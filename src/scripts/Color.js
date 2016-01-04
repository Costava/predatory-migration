var Util = require('./Util.js');

function Color(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

/*
 * Returns a random color object
 * @param {number} [alpha=1] - alpha value of color
 */
Color.random = function(alpha) {
	var r = Util.randomInt(0, 255);
	var g = Util.randomInt(0, 255);
	var b = Util.randomInt(0, 255);

	var a;
	if (typeof alpha == 'number') {
		a = alpha;
	}
	else {
		a = 1;
	}

	return new Color(r, g, b, a);
}

Color.prototype.toString = function(excludeA) {
	if (excludeA) {
		return `rgb(${this.r}, ${this.g}, ${this.b})`;
	}

	return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
};

Color.prototype.floored = function(includeA) {
	var c = new Color(Math.floor(this.r), Math.floor(this.g), Math.floor(this.b), this.a);

	if (includeA) {
		c.a = Math.floor(c.a);
	}

	return c;
};

Color.prototype.inverse = function(invertA) {
	if (invertA) {
		return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1 - this.a);
	}

	return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
};

Color.prototype.invert = function(invertA) {
	this.r = 255 - this.r;
	this.g = 255 - this.g;
	this.b = 255 - this.b;

	if (invertA) {
		this.a = 1 - this.a;
	}
};

Color.prototype.clamp = function() {
	['r', 'g', 'b'].forEach(function(letter, index, letters) {
		this[letter] = Math.max(Math.min(this[letter], 255), 0);
	}.bind(this));

	this.a = Math.max(Math.min(this.a, 1), 0);
};

Color.prototype.clone = function() {
	return new Color(this.r, this.g, this.b, this.a);
};

module.exports = Color;
