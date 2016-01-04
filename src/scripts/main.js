console.log("main");

//////////

var Util = require('./Util.js');

var Canvas = require('./Canvas.js');

var Audio = require('./Audio.js');
var Images = require('./Images.js');

var Game = require('./Game.js');
var MiniMap = require('./MiniMap.js');
var Player = require('./Player.js');

var Vector2 = require('./Vector2');
var Controls = require('./Controls.js');

//////////

var c = document.querySelector('.js-canv');
var ctx = c.getContext('2d');

// So that images are not blurry when upscaled
Canvas.setImageSmoothing(ctx, false);

c.requestPointerLock = c.requestPointerLock || c.mozRequestPointerLock || c.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

//////////

var audio = new Audio();
audio.add('birdDeath', ['audio/bird.wav'], 'other');
audio.add('birdCall', ['audio/shriek.wav'], 'other');
audio.add('hurt', ['audio/hit.wav'], 'other');
audio.add('shoot', ['audio/shoot.wav'], 'shooting');

audio.setupDone = true;

var images = new Images();
images.load('img/ball.png', 'ball');
images.load('img/bird.png', 'bird');
images.load('img/tree1.png', 'tree1');
images.load('img/tree2.png', 'tree2');
images.load('img/tree3.png', 'tree3');
images.load('img/tree4.png', 'tree4');

images.setupDone = true;

//////////

var game = new Game();

game.audio =  audio;
game.images = images;

game.c = c;
game.ctx = ctx;

game.requestPointerLock = function() {
	c.requestPointerLock();
};
game.exitPointerLock = function() {
	document.exitPointerLock();
};

//////////

game.loop = function() {
	game.newTime = new Date().getTime();
	game.dt = game.newTime - game.oldTime;// milliseconds
	game.gameTime += game.dt;

	// console.log(`Num enemies: ${game.enemies.length}`);
	// console.log(`Num shots: ${game.shots.length}`);

	var dirOffsetVector = Controls.getDirOffsetVector('keyboard');

	// Only move if controls are pressed
	if (dirOffsetVector.x != 0 || dirOffsetVector.y != 0) {
		// console.log("move");
		var dirOffset = Math.atan2(dirOffsetVector.y, dirOffsetVector.x);
		var finalDir = game.player.direction + dirOffset;

		game.player.move(game.player.speed, finalDir, game.dt);
	}

	// Move enemies
	game.enemies.forEach(function(ene, index, array) {
		ene.moveTowards(game.player.pos, game.enemySpeed, game.dt);

		ene.distance = Vector2.distance(ene.pos, game.player.pos);

		['call', 'hurt'].forEach(function(term, termIndex, termArray) {
			if (ene.distance <= game[term + 'Distance']) {
				var timeSinceLastAction = new Date().getTime() - ene[term+'Time'];

				if (ene[term + 'Time'] == undefined || timeSinceLastAction > game[term + 'Timeout']) {
					if (term === 'call') {
						game.audio.howls.birdCall.play();
					}
					else if (term === 'hurt') {
						game.hits += 1;

						game.overlayColor.a = 0.5;

						game.audio.howls.hurt.play();
					}

					ene[term + 'Time'] = new Date().getTime();
				}
			}
		});
	});

	// delete shots that are out of bounds
	for (var i = 0; i < game.shots.length; i++) {
		if (!Vector2.insideRect(game.shots[i].pos, game.origin, game.mapWidth, game.mapHeight)) {
			[game.nonPlayers, game.minimap.entities, game.shots].forEach(function(innerArray, index, outerArray) {
				innerArray.splice(innerArray.indexOf(game.shots[i]), 1);
			});
		}
	}

	// move shots
	game.shots.forEach(function(shot) {
		shot.move(game.shootSpeed, shot.direction, game.dt);
	});

	// check for shot and enemy collision
	for (var i = 0; i < game.shots.length; i++) {
		for (var j = 0; j < game.enemies.length; j++) {
			var distance = Vector2.distance(game.shots[i].pos, game.enemies[j].pos);

			if (distance <= game.enemyRadius) {
				// Remove the colliding shot and enemy from the minimap and game
				[game.nonPlayers, game.minimap.entities].forEach(function(innerArray, index) {
					innerArray.splice(innerArray.indexOf(game.enemies[j]), 1);
					innerArray.splice(innerArray.indexOf(game.shots[i]), 1);
				});

				// unlist colliding enemy and shot
				game.enemies.splice(j, 1);
				game.shots.splice(i, 1);

				game.score += 1;

				game.audio.howls.birdDeath.play();

				break;
			}
		}
	}

	// spawn new enemy if applicable
	if (game.gameTime - game.spawnTime > game.spawnTimeout) {
		// spawn new enemy
		// console.log("New enemy spawned");

		var pos = Vector2.randomPointAround(
			game.player.pos,
			0,
			2 * Math.PI,
			game.minSpawnDist,
			game.maxSpawnDist
		);

		var blipColor = game.randomEnemyBlipColor();

		game.addEnemy(pos, blipColor);

		game.spawnTime = game.gameTime;
	}

	// shoot if mouse down
	if (game.mouseButtonDown) {
		game.tryShoot();
	}

	// if player not inside map
	if (!Vector2.insideRect(game.player.pos, game.origin, game.mapWidth, game.mapHeight) && !game.paused) {
		document.querySelector('.modal-wrapper').style.height = '100%';
	}
	else {
		document.querySelector('.modal-wrapper').style.height = '0';
	}

	if (game.hits > game.hitLimit) {
		// Die
		game.endGameCleanUp();

		// hide 'out of bounds' message
		document.querySelector('.modal-wrapper').style.height = '0';

		// update score
		Array.prototype.forEach.call(document.querySelectorAll('.js-score'), function(field) {
			field.innerHTML = game.score;
		});

		// update high score if applicable
		var newHighScoreText = "";
		if (game.score > game.highScore) {
			game.highScore = game.score;

			newHighScoreText = 'New ';
		}

		Array.prototype.forEach.call(document.querySelectorAll('.js-high-score'), function(field) {
			field.innerHTML = game.highScore;
		});

		document.querySelector('.js-new').innerHTML = newHighScoreText;

		showMenu(menus.end);
	}

	// lower alpha of overlay if above 0
	if (game.overlayColor.a > 0) {
		var da = game.dt * game.overlayFadeSpeed;

		if (da > game.overlayColor.a) {
			game.overlayColor.a = 0;
		}
		else {
			game.overlayColor.a -= da;
		}
	}

	game.render(c, ctx);

	game.oldTime = game.newTime;

	if (game.looping) {
		window.requestAnimationFrame(game.loop);
	}
};

//////////

function handleResize() {
	c.width = c.clientWidth;
	c.height = c.width * (9 / 16);

	var dim = c.width * 0.20;
	game.minimap.resize(dim, dim);

	game.render(c, ctx);
}
window.addEventListener('resize', handleResize);
handleResize();// initial run

var menus = {};
var menuList = ['loading', 'main', 'pause', 'end'];
menuList.forEach(function(menu) {
	menus[menu] = document.querySelector(`.js-${menu}-menu`);
});

function showMenu(menu) {
	menu.style['margin-left'] = '0';
}

function hideMenu(menu) {
	menu.style['margin-left'] = '100%';
}

// hide all menus
menuList.forEach(function(menu) {
	hideMenu(menus[menu]);
});

function masterVolume(vol) {
	var newVolume = vol;

	console.log(`master volume: ${newVolume}`);

	// apply new volume
	Howler.volume(newVolume);

	// update sliders
	Array.prototype.forEach.call(document.querySelectorAll('.js-master'), function(slider) {
		slider.value = newVolume;
	});
}

function categoryVolume(category, vol) {
	var newVol = vol;

	console.log(`${category} volume: ${newVol}`);

	// apply new volume
	audio.setCategoryVolume(category, newVol);

	// update sliders
	Array.prototype.forEach.call(document.querySelectorAll(`.js-${category}`), function(slider) {
		slider.value = newVol;
	});
}

showMenu(menus.loading);

var allLoaded = false;
function loadingCheck() {
	if (audio.doneLoading() && images.doneLoading()) {
		hideMenu(menus.loading);

		masterVolume(0.5);
		categoryVolume('shooting', 0.4);
		categoryVolume('other', 0.8);

		showMenu(menus.main);

		allLoaded = true;
	}

	if (!allLoaded) {
		window.requestAnimationFrame(loadingCheck);
	}
}
loadingCheck();

// set pause and resume callbacks
game.pauseCallback = function() {
	document.querySelector('.modal-wrapper').style.height = '0';

	// update score
	Array.prototype.forEach.call(document.querySelectorAll('.js-score'), function(field) {
		field.innerHTML = game.score;
	});

	showMenu(menus.pause);
};

game.resumeCallback = function() {
	hideMenu(menus.pause);
};

// handle `E` keypress for pausing/resuming
document.addEventListener('keydown', function(e) {
	var key = Controls.getKey(e.keyCode);

	if (key === 'E') {
		if (game.started && !game.paused) {
			game.pause();
		}
		else if (game.started && game.paused) {
			game.resume();
		}
	}
});

document.querySelector('.js-start').addEventListener('click', function() {
	hideMenu(menus.main);

	game.startGame();
});

Array.prototype.forEach.call(document.querySelectorAll('.js-master'), function(input) {
	input.addEventListener('change', function() {
		var newVolume = parseFloat(this.value);

		masterVolume(newVolume);
	});
});

Array.prototype.forEach.call(document.querySelectorAll('.js-shooting'), function(input) {
	input.addEventListener('change', function() {
		var newVolume = parseFloat(this.value);

		categoryVolume('shooting', newVolume);
	});
});

Array.prototype.forEach.call(document.querySelectorAll('.js-other'), function(input) {
	input.addEventListener('change', function() {
		var newVolume = parseFloat(this.value);

		categoryVolume('other', newVolume);
	});
});

Array.prototype.forEach.call(document.querySelectorAll('.js-mouse-sens'), function(input) {
	input.addEventListener('change', function() {
		var newSens = parseFloat(this.value);

		console.log(`Mouse Sensitivity: ${newSens}`);

		Controls.mouseSens = newSens;

		Array.prototype.forEach.call(document.querySelectorAll('.js-mouse-sens'), function(slider) {
			slider.value = newSens;
		});
	});
});

document.querySelector('.js-resume').addEventListener('click', function() {
	hideMenu(menus.pause);

	game.resume();
});

document.querySelector('.js-pause-return').addEventListener('click', function() {
	game.endGameCleanUp();

	hideMenu(menus.pause);
	showMenu(menus.main);
});

document.querySelector('.js-again').addEventListener('click', function() {
	hideMenu(menus.end);

	game.startGame();
});

document.querySelector('.js-end-return').addEventListener('click', function() {
	hideMenu(menus.end);
	showMenu(menus.main);
});
