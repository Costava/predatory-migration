var Vector2 = require('./Vector2');

/*
 * @param [number] horizonDistance - distance to horizonDistance
 */
function View(width, height, fieldOfView, horizonDistance, fgHeight) {
	this.width = width;
	this.height = height;

	this.fieldOfView = fieldOfView;
	this.horizonDistance = horizonDistance;
	this.fgHeight = fgHeight;

	this.entities = [];
	this.entityScale = 1;
}

/*
 * Get the 3 points of the view triangle in dir direction having fieldOfView and viewDistance
 * @returns {array} vertices - vertices of array in clockwise order
 */
View.prototype.viewTriangleVertices = function(pos, dir, fieldOfView, viewDistance) {
	var vertices = [];
	vertices.push(pos);

	// angle of view triangle that is away from pos
	// in rads
	// 2*outerAngle + fieldOfView = 2pi
	var outerAngle = (Math.PI / 2) - (fieldOfView / 2);
	// length of sides of view triangle
	// (view triangle is isoceles tri with unique side across from pos)
	var sideLength = viewDistance / Math.sin(outerAngle);
	//console.log("sideLength", sideLength);

	// console.log(dir);
	var startAngle = dir - (fieldOfView/2);
	var endAngle = dir + (fieldOfView/2);
	// console.log("start", startAngle, "end", endAngle);

	var edx = sideLength * Math.cos(endAngle);
	var edy = sideLength * Math.sin(endAngle);

	var sdx = sideLength * Math.cos(startAngle);
	var sdy = sideLength * Math.sin(startAngle);

	// pos -> vert2 -> vert3 is clockwise
	var vert2 = {};
	vert2.x = pos.x + edx;
	vert2.y = pos.y - edy;

	var vert3 = {};
	vert3.x = pos.x + sdx;
	vert3.y = pos.y - sdy;

	vertices.push(vert2);
	vertices.push(vert3);

	return vertices;
};

/*
 * Returns true if p is inside the triangle with points p0-2
 */
View.prototype.pointInsideTriangle = function(p, p0, p1, p2) {
	// http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-triangle
	var area = 0.5 * (-p1.y*p2.x + p0.y*(-p1.x + p2.x) + p0.x*(p1.y - p2.y) + p1.x*p2.y);

	var s = 1/(2*area)*(p0.y*p2.x - p0.x*p2.y + (p2.y - p0.y)*p.x + (p0.x - p2.x)*p.y);
	var t = 1/(2*area)*(p0.x*p1.y - p0.y*p1.x + (p0.y - p1.y)*p.x + (p1.x - p0.x)*p.y);

	if (s>0 && t>0 && 1-s-t>0) {
		return true;
	}

	return false;
};

View.prototype.normalizeAngle = function(rads) {
	var angle = rads % (2*Math.PI);

	angle = (angle + 2*Math.PI) % (2*Math.PI);

	if (angle > Math.PI) {
		angle -= 2*Math.PI;
	}

	return angle;
};

View.prototype.getPerpPoint = function(pos1, dir, pos2) {
	var point = {};
	var normDir = View.prototype.normalizeAngle(dir);

	if (normDir == Math.PI/2 || normDir == (3*Math.PI)/4) {
		point.x = pos1.x;
		point.y = pos2.y;
	}
	else {
		var m = Math.tan(dir);
		m = -m;

		point.x = ( m*m*pos1.x - m*pos1.y + pos2.x + m*pos2.y ) / (m*m + 1);
		point.y = m*(point.x - pos1.x) + pos1.y;
	}

	return point;
};

View.prototype.drawEntities = function(ctx, width, height, fgHeight, pos, dir, fieldOfView, viewDistance, entities, entityScale) {
	for (var i = 0; i < entities.length; i++) {
		View.prototype.drawEntity(ctx, width, height, fgHeight, pos, dir, fieldOfView, viewDistance, entities[i], entityScale);
	}
};

View.prototype.renderEntity = function(ctx, img, xCenter, yBottom, scale, scaledWidth, scaledHeight) {
	ctx.save();
	ctx.translate(xCenter - scaledWidth/2, yBottom - scaledHeight);

	ctx.scale(scale, scale);
	ctx.drawImage(img, 0, 0);
	ctx.restore();
};

View.prototype.drawEntity = function(ctx, width, height, fgHeight, pos, dir, fieldOfView, viewDistance, entity, entityScale) {
	var viewTriVerts = View.prototype.viewTriangleVertices(pos, dir, fieldOfView, viewDistance);
	// console.log(viewTriVerts);

	if (View.prototype.pointInsideTriangle(entity.pos, viewTriVerts[0], viewTriVerts[1], viewTriVerts[2])) {
		// console.log("in");
		var perpPoint = View.prototype.getPerpPoint(pos, dir, entity.pos);

		var forwardDist = Vector2.distance(pos, perpPoint);
		var sideDist = Vector2.distance(entity.pos, perpPoint);

		// half length of opposite side of view triangle
		var fullHalfSide = ( forwardDist * Math.sin(fieldOfView/2) ) / Math.sin( (Math.PI - fieldOfView)/2 );

		var linearProp = forwardDist / viewDistance;
		var forwardProp = Math.pow(linearProp, 0.2);
		// ^ Because being 1 pixel closer to the horizon near the horizon
		//   is a farther distance than being 1 pixel closer to the horizon
		//   at the bottom of the screen

		var sideProp = sideDist / fullHalfSide;

		// x distance from center of screen
		var dx = sideProp * (width/2);

		// center of where entity will be drawn on ctx
		var yBottom = height - forwardProp * fgHeight;

		// pos.y - entities[i].pos.y because [what was I going to write]
		var angleToEnt = Math.atan2(pos.y - entity.pos.y, entity.pos.x - pos.x);

		var normalDir = View.prototype.normalizeAngle(dir);
		var normalAngle = View.prototype.normalizeAngle(angleToEnt);

		// z component of the cross product of normalDir and normalAngle
		// the sign of crossZ determines whethere the entity is left or right
		// of the center of the screen
		// http://gamedev.stackexchange.com/questions/85846/how-to-calculate-left-right-oriented-angle-between-two-2d-vectors
		var crossZ = Math.cos(normalDir) * Math.sin(normalAngle) - Math.sin(normalDir) * Math.cos(normalAngle);

		var xCenter = width/2;
		if (crossZ < 0) {
			xCenter += dx;
		}
		else {
			xCenter -= dx;
		}

		var scale = entityScale * entity.imgScale * (1 - forwardProp);

		var scaledWidth = entity.img.width * scale;
		var scaledHeight = entity.img.height * scale;

		View.prototype.renderEntity(ctx, entity.img, xCenter, yBottom, scale, scaledWidth, scaledHeight);
	}
};

module.exports = View;
