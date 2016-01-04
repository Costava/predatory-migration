var Vector2 = {};

/*
 * Is v inside the rect with top left at origin
 */
Vector2.insideRect = function(v, origin, width, height) {
	if (v.x >= origin.x && v.x < origin.x + width &&
		v.y >= origin.y && v.y < origin.y + height)
	{
		return true;
	}

	return false;
};

Vector2.distance = function(v1, v2) {
	return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
};

// Returns a point randomly around v
// minimums are inclusive, maximums are exclusive
Vector2.randomPointAround = function(v, minDir, maxDir, minDist, maxDist) {
	var dir = Math.random() * (maxDir - minDir) + minDir;
	var dist = Math.random() * (maxDist - minDist) + minDist;

	var dx = dist * Math.cos(dir);
	var dy = dist * Math.sin(dir);

	return {x: v.x + dx, y: v.y + dy};
};

module.exports = Vector2;
