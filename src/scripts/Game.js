var Util = require('./Util.js');

var Vector2 = require('./Vector2.js');
var Entity = require('./Entity');
var View = require('./View.js');
var Controls = require('./Controls.js');
var Color = require('./Color.js');

var MiniMap = require('./MiniMap.js');
var Player = require('./Player.js');

function Game() {
	// top left of game map
	this.origin = {x: 0, y: 0};

	this.groundColor = '#75f363';
	this.skyColor = '#3251aa';

	this.minSpawnDist = 100;
	this.maxSpawnDist = 200;

	this.spawnTime = 0;// last time an enemy spawned (milliseconds)
	this.spawnTimeout = 200;// milliseconds

	this.nonPlayers = [];
	this.enemies = [];
	this.shots = [];

	this.hits = 0;
	this.hitLimit = 5;// Dead at this many or more hits

	// speeds in units per millisecond
	this.playerSpeed = 0.030;
	this.enemySpeed = 0.010;
	this.shootSpeed = 0.080;
	this.shootTimeout = 100;// milliseconds
	//this.shootTime;// will be in milliseconds

	this.callDistance = 10;
	this.callTimeout = 4000;// milliseconds
	// this.callTime;// will be in milliseconds

	this.hurtDistance = 5;
	this.hurtTimeout = 1000;// milliseconds
	// this.hurtTime;// will be in milliseconds

	// size of enemy for being hit by shots
	this.enemyRadius = 5;

	this.mapWidth = 200;
	this.mapHeight = 200;
	this.treeNumber = 38;
	this.initialEnemyNumber = 15;

	this.overlayColor = new Color(250, 10, 10, 0);
	this.overlayFadeSpeed = 0.0005;// units per millisecond

	this.mouseButtonDown = false;

	this.newTime = 0;
	this.oldTime = 0;
	this.gameTime = 0;

	this.minimap = new MiniMap({x: 10, y: 10}, 108, 108, {x: 0, y: 0}, this.mapWidth, this.mapHeight);
	this.minimap.fillColor = '#75F363';

	this.player = Player({x: 100, y: 130}, Math.PI / 2);
	this.player.blipColor = 'blue';
	this.player.viewDistance = 120;
	this.player.speed = 20;

	this.minimap.entitiesAD.push(this.player);

	this.score = 0;
	this.highScore = 0;

	this.started = false;
	this.paused = false;

	this.loop = function() {};
	this.pauseCallback = function() {};
	this.resumeCallback = function() {};

	this.requestPointerLock = function() {};
	this.exitPointerLock = function() {};
}

Game.prototype.randPos = function() {
	var x = Util.randomInt(this.origin.x, this.mapWidth - 1);
	var y = Util.randomInt(this.origin.y, this.mapHeight - 1);

	return {x: x, y: y};
};

Game.prototype.addTree = function(pos, blipColor, imageNum) {
	var tree = new Entity(pos);
	tree.blipColor = blipColor;
	tree.img = this.images.i['tree' + imageNum];

	this.nonPlayers.push(tree);
	this.minimap.entities.push(tree);
};

Game.prototype.addRandomTree = function() {
	var randPos = this.randPos();

	var blipColor = 'rgb(10,' + Util.randomInt(40, 80) + ',10)';

	var imageNum = Util.randomInt(1, 4);

	this.addTree(randPos, blipColor, imageNum);
};

Game.prototype.addEnemy = function(pos, blipColor) {
	var ene = new Entity(pos);
	ene.blipColor = blipColor;
	ene.img = this.images.i.bird;

	this.nonPlayers.push(ene);
	this.enemies.push(ene);
	this.minimap.entities.push(ene);
};

Game.prototype.randomEnemyBlipColor = function() {
	return 'rgb(' + Util.randomInt(150, 250) + ', 10, 10)';
};

Game.prototype.addRandomEnemy = function() {
	var blipColor = this.randomEnemyBlipColor();

	var randPos = this.randPos();

	this.addEnemy(randPos, blipColor);
};

Game.prototype.addShot = function(pos, dir) {
	var shot = new Entity(pos);
	shot.blipColor = 'yellow';
	shot.direction = dir;
	shot.img = this.images.i.ball;

	this.nonPlayers.push(shot);
	this.shots.push(shot);
	this.minimap.entities.push(shot);
};

// Draw complete game frame onto ctx
Game.prototype.render = function(c, ctx) {
	var fgHeight = 5 * c.height / 8;
	var entityScale = c.height / 100;

	ctx.save();

	ctx.clearRect(0, 0, c.width, c.height);
	ctx.fillStyle = this.groundColor;
	ctx.fillRect(0, c.height - fgHeight, c.width, fgHeight);

	// bind so that this.player.pos has 'this' that is the game object
	this.nonPlayers.sort(function(a, b) {
		// console.log("this", this);
		var aDistance = Vector2.distance(this.player.pos, a.pos);
		var bDistance = Vector2.distance(this.player.pos, b.pos);

		return bDistance - aDistance;
	}.bind(this));

	View.prototype.drawEntities(ctx, c.width, c.height, fgHeight, this.player.pos, this.player.direction, this.player.fieldOfView, this.player.viewDistance, this.nonPlayers, entityScale);

	this.minimap.draw(ctx);

	// draw overlay
	ctx.fillStyle = this.overlayColor.toString(false);
	ctx.fillRect(0, 0, c.width, c.height);

	ctx.restore();
};

Game.prototype.startGame = function() {
	this.shots = [];
	this.enemies = [];
	this.nonPlayers = [];

	this.hits = 0;
	this.score = 0;

	this.shootSoundIndex = 0;

	this.overlayColor.a = 0;

	this.minimap = new MiniMap({x: 10, y: 10}, 108, 108, {x: 0, y: 0}, this.mapWidth, this.mapHeight);
	this.minimap.fillColor = '#75F363';

	this.player = Player({x: 100, y: 130}, Math.PI / 2);
	this.player.blipColor = 'blue';
	this.player.viewDistance = 120;
	this.player.speed = this.playerSpeed;

	this.minimap.entitiesAD.push(this.player);

	// update minimap sizing
	var dim = this.c.width * 0.20;
	this.minimap.resize(dim, dim);

	this.fpMouseWrapper = this.fpMouse.bind(this);
	this.mousedownWrapper = this.mousedown.bind(this);
	this.mouseupWrapper = this.mouseup.bind(this);

	for (var i = 0; i < this.treeNumber; i++) {
		this.addRandomTree();
	}

	for (var i = 0; i < this.initialEnemyNumber; i++) {
		var pos = Vector2.randomPointAround(this.player.pos, 0, 2 * Math.PI, 100, 250);
		var blipColor = this.randomEnemyBlipColor();

		this.addEnemy(pos, blipColor);
	}

	this.bindControls = function() {
		document.addEventListener('keydown', Controls.keydown);
		document.addEventListener('keyup', Controls.keyup);

		document.addEventListener('mousemove', this.fpMouseWrapper);
		document.addEventListener('mousedown', this.mousedownWrapper);
		document.addEventListener('mouseup', this.mouseupWrapper);
	};

	this.unbindControls = function() {
		document.removeEventListener('keydown', Controls.keydown);
		document.removeEventListener('keyup', Controls.keyup);

		document.removeEventListener('mousemove', this.fpMouseWrapper);
		document.removeEventListener('mousedown', this.mousedownWrapper);
		document.removeEventListener('mouseup', this.mouseupWrapper);
	};

	this.bindControls();

	this.oldTime = new Date().getTime();

	this.started = true;
	this.paused = false;
	this.looping = true;

	this.requestPointerLock();

	this.loop();
};

Game.prototype.pause = function() {
	this.looping = false;
	this.paused = true;

	this.exitPointerLock();

	this.unbindControls();

	// reset controls
	Controls.keyDownMap = {};
	this.mouseButtonDown = false;

	this.pauseCallback();
};

Game.prototype.resume = function() {
	this.looping = true;
	this.paused = false;

	this.resumeCallback();

	this.bindControls();

	this.oldTime = new Date().getTime();

	this.requestPointerLock();

	this.loop();
}

Game.prototype.endGameCleanUp = function() {
	this.looping = false;
	this.started = false;
	this.paused = false;

	this.exitPointerLock();

	this.unbindControls();

	// reset controls
	Controls.keyDownMap = {};
	this.mouseButtonDown = false;
};

Game.prototype.tryShoot = function() {
	// console.log('tryShoot');
	var timeSinceLastAction = new Date().getTime() - this.shootTime;

	// if enough time passed since last shot
	if (this.shootTime === undefined || timeSinceLastAction > this.shootTimeout) {
		// console.log('shootTimeout passed');

		// if player inside map
		if (Vector2.insideRect(this.player.pos, this.origin, this.mapWidth, this.mapHeight)) {
			// console.log('player inside map');
			this.addShot(this.player.pos, this.player.direction);

			this.audio.howls.shoot.play();

			this.shootTime = new Date().getTime();
		}
	}
};

Game.prototype.mousedown = function() {
	this.mouseButtonDown = true;
};

Game.prototype.mouseup = function() {
	this.mouseButtonDown = false;
};

Game.prototype.fpMouse = function(e) {
	var dx = e.movementX || e.mozMovementX || 0;

	// delta radians
	var dr = dx * Controls.mouseSens * -1;

	this.player.direction += dr;
};

module.exports = Game;
