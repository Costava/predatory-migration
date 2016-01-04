var Canvas = require('./Canvas.js');

function Entity(pos) {
	this.pos = {};
	this.pos.x = pos.x;
	this.pos.y = pos.y;

	this.blipColor = '#000';
	this.blipRadius = '4';
	this.img = new Image();
	this.img.src = 'img/bird.png';
	this.imgScale = 1;
}

Entity.prototype.drawBlip = function(ctx) {
	Canvas.fillCircle(ctx, 0, 0, this.blipRadius, this.blipColor);
};

/*
 * @param {number} dt - in seconds
 */
Entity.prototype.move = function(speed, direction, dt) {
	var dx = Math.cos(direction) * speed * dt;
	// Multiply dy by -1 because positive moves down canvas
	var dy = Math.sin(direction) * speed * dt * -1;

	this.pos.x += dx;
	this.pos.y += dy;
};

/*
 * Move towards {object} target (having x and y properties) with
 * {number} speed for {number} dt time (in seconds)
 */
Entity.prototype.moveTowards = function(target, speed, dt) {
	var distX = target.x - this.pos.x;
	var distY = target.y - this.pos.y;

	var dir = Math.atan2(distY, distX);
	var magnitude = speed * dt;

	var dx = magnitude * Math.cos(dir);
	var dy = magnitude * Math.sin(dir);

	if (Math.abs(dx) > Math.abs(distX)) {
		this.pos.x = target.x;
	}
	else {
		this.pos.x += dx;
	}

	if (Math.abs(dy) > Math.abs(distY)) {
		this.pos.y = target.y;
	}
	else {
		this.pos.y += dy;
	}
};

module.exports = Entity;
