var Vector2 = require('./Vector2.js');
var Canvas = require('./Canvas.js');

function MiniMap(pos, width, height, viewPos, viewWidth, viewHeight) {
	this.pos = {};
	this.pos.x = pos.x;
	this.pos.y = pos.y;

	this.width = width;
	this.height = height;

	this.view = {};

	this.view.pos = {};
	this.view.pos.x = viewPos.x;
	this.view.pos.y = viewPos.y;

	this.view.width = viewWidth;
	this.view.height = viewHeight;

	this.borderWidth = 4;
	this.borderColor = '#000';
	this.fillColor = '';

	this.entities = [];
	// Always Drawn. Does not check if inside view.
	// Player will be inside eAD so that player's view triangle
	//  will be drawn even when player is outside the view of minimap
	this.entitiesAD = [];
	this.hideEntities = false;
	// this.entityScale = 1;
}

MiniMap.prototype.getInnerWidth = function() {
	return this.width - 2 * this.borderWidth;
};

MiniMap.prototype.getInnerHeight = function() {
	return this.height - 2 * this.borderWidth;
};

MiniMap.prototype.resize = function(newWidth, newHeight) {
	this.width = newWidth;
	this.height = newHeight;

	this.borderWidth = this.width / 50;
};

MiniMap.prototype.drawEntityBlip = function(ctx, entity) {
	// Difference between entity's location and
	// top left coord of the minimap's view
	var xDiff = entity.pos.x - this.view.pos.x;
	var yDiff = entity.pos.y - this.view.pos.y;

	ctx.save();

	ctx.translate(xDiff, yDiff);

	entity.drawBlip(ctx);

	ctx.restore();
};

MiniMap.prototype.draw = function(ctx) {
	var scratchCanv = document.createElement('canvas');
	var scratchCtx = scratchCanv.getContext('2d');

	var innerWidth = this.getInnerWidth();
	var innerHeight = this.getInnerHeight();

	scratchCanv.width = innerWidth;
	scratchCanv.height = innerHeight;

	var xScale = innerWidth / this.view.width;
	var yScale = innerHeight / this.view.height;

	scratchCtx.translate(this.view.pos.x, this.view.pos.y);
	scratchCtx.scale(xScale, yScale);

	// Draw fill if there
	if (this.fillColor.length > 0) {
		Canvas.drawBorderBox(ctx, this.pos.x, this.pos.y, this.width, this.height, this.borderWidth, '', this.fillColor);
	}

	// Draw entities if not hidden
	if (!this.hideEntities) {
		this.entities.forEach(function(entity) {
			if (Vector2.insideRect(entity.pos, this.view.pos, this.view.width, this.view.height)) {
				this.drawEntityBlip(scratchCtx, entity);
			}
		}.bind(this));

		this.entitiesAD.forEach(function(entity) {
			this.drawEntityBlip(scratchCtx, entity);
		}.bind(this));
	}

	ctx.drawImage(scratchCanv, this.pos.x + this.borderWidth, this.pos.y + this.borderWidth);

	// Draw border
	Canvas.drawBorderBox(ctx, this.pos.x, this.pos.y, this.width, this.height, this.borderWidth, this.borderColor, '');
};

module.exports = MiniMap;
