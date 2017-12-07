/*******************************************************************************
 * Copyright (c) 2014 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *   http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *   Bryan Boyd - Initial implementation 
 *   U. Siddiqui - Extended for traffic simulation
 *******************************************************************************/

/*****************************************************************************
 *                            
 *                                FencePolygon
 *
 ****************************************************************************/
// Traffic simulation: constructor with id
function FencePolygon(id) {
	MapPolygon.call(this, Utils.randomString(20));
	this.type = "FencePolygon";
	this.numPoints = null;
	this.points = null;
	this.finished = true;
	this.filled = true;
	this.color = "rgba(0,0,255,0.2)";
	// Traffic simulation: initialize the default zone type, point radius and id
	this.zoneType = "Default";
	this.pointRadius = 5;
	this.id = id;
}

FencePolygon.prototype = new MapPolygon();
FencePolygon.prototype.constructor = MapPolygon;

FencePolygon.prototype.movePoint = function(index, dx, dy) {
	var oldPos = Utils.geoToXY(this.points[index].lon, this.points[index].lat, true);
	oldPos.x += dx;
	oldPos.y += dy;
	var newGeo = Utils.xyToGeo(oldPos.x, oldPos.y, true);
	this.points[index].lon = newGeo.lon;
	this.points[index].lat = newGeo.lat;
}

FencePolygon.prototype.move = function(dx, dy) {
	for (var i in this.points) {
		this.movePoint(i, dx, dy);
	}
}

FencePolygon.prototype.moveEdge = function(startIndex, endIndex, dx, dy) {
	this.movePoint(startIndex, dx, dy);
	this.movePoint(endIndex, dx, dy);
}

FencePolygon.prototype.getPointsString = function() {
	var fence_polygon = "";
	var sep = "";
	for (var i in this.points) {
		fence_polygon += sep + this.points[i].lon + "," + this.points[i].lat;
		sep = ":";
	}
	return fence_polygon;
}

FencePolygon.prototype.getPointsJSON = function() {
	var points = [];
	for (var i in this.points) {
		points.push({ latitude: this.points[i].lat, longitude: this.points[i].lon });
	}
	return points;
}

function getDefaultFencePolygon(center, numPoints) {
	var centerXY = Utils.geoToXY(center);
	var radius = Math.min(win.width, win.height) / 6;
	var points = [];
	for (var i = 0; i < numPoints; i++) {
		var angle = i * 2 * Math.PI / numPoints;
		var delta = { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
		points.push(Utils.xyToGeo({ x: centerXY.x + delta.x, y: centerXY.y + delta.y }));
	}
	return points;
}

// Traffic simulation: set the zone type
FencePolygon.prototype.setZoneType = function(val) {
	this.zoneType = val;
	this.updateColorForZoneType();
}
// Traffic simulation: get the zone type
FencePolygon.prototype.getZoneType = function() {
	return this.zoneType;
}
// Traffic simulation: set color according to the zone type
FencePolygon.prototype.updateColorForZoneType = function() {

	if ( this.zoneType == "Accident"){
		// red
		this.color = "rgba(255,0,0,0.2)";
	} else if ( this.zoneType == "Residential"){
		// green
		this.color = "rgba(0,102,102,0.4)";
	} else if (this.zoneType == "Commercial"){
		// purple
		this.color = "rgba(76,0,153,0.3)";
	} else if (this.zoneType == "Industrial"){
		// maroon
		this.color = "rgba(128,0,0,0.2)";
	} else if ( this.zoneType== "Construction"){
		// orange
		this.color = "rgba(255,128,0,0.4)";
	} else {
		// default
		this.color = "rgba(0,0,255,0.2)";
	} 
}