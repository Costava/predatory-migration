var Util = {};

/*
 * Returns an integer between min and max (both inclusive)
 */
Util.randomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = Util;
