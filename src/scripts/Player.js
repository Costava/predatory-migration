var Canvas = require('./Canvas');
var Entity = require('./Entity');

/*
 * @param {object} pos - position object with x and y properties
 * @param {number} direction
 * 	- direction of player in radians
 * 	- 0 radians is facing right
 */
function Player(pos, direction) {
	var player = new Entity(pos);

	player.direction = direction;

	// speed in units per millisecond
	player.speed = 0.020;

	player.fieldOfView = Math.PI / 2;
	player.viewDistance = 50;

	player.drawBlip = function(ctx) {
		Canvas.drawPlayerBlip(ctx, 0, 0, player.blipRadius, player.blipRadius / 3, player.direction, player.blipColor);;
		Canvas.drawViewTri(ctx, 0, 0, player.direction, player.fieldOfView, player.viewDistance);
	};

	return player;
}

module.exports = Player;
