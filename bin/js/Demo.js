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


var Utils = {
	_fromProjection:  new OpenLayers.Projection("EPSG:4326"),
	_toProjection: new OpenLayers.Projection("EPSG:900913"),

	toOL: function(xy) {
		var result = xy;
		return result.transform(this._fromProjection, this._toProjection);
	},
	toLL: function(xy) {
		var result = xy;
		return result.transform(this._toProjection, this._fromProjection);
	},

	getCurrentTime: function() { 
		var d = new Date(); 
		var ms = d.getMilliseconds();
		mstr = ms;
		if (ms < 100 && ms >= 10) {
			mstr = "0" + ms;
		} else if (ms < 10) {
			mstr = "00" + ms;
		}
		return d.getSeconds() + ":" + mstr; 
	},

	randomString: function(length) {
		var text = "";
		var allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		for (var i = 0; i < length; i++) {
			text += allowed.charAt(Math.floor(Math.random() * allowed.length));
		}
		return text;
	},

	randomUppercaseString: function(length) {
		var text = "";
		var allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for (var i = 0; i < length; i++) {
			text += allowed.charAt(Math.floor(Math.random() * allowed.length));
		}
		return text;
	},

	publish: function(topic, message, retained) {
		var msgObj = new Messaging.Message(message);
		msgObj.destinationName = topic;
		if (retained) { msgObj.retained = true; }
		demo.mqttclient.client.send(msgObj);
	},

	geoToXY: function(lon, lat) {
		if (!lat) {
			var geo = lon;
			lat = geo.lat;
			lon = geo.lon;
		}
		var xy = { 
			x: (parseFloat(lon) - demo.ui.getMinLon()) / (demo.ui.getMaxLon() - demo.ui.getMinLon()) * win.width,
			y: win.height - ((parseFloat(lat) - demo.ui.getMinLat()) / (demo.ui.getMaxLat() - demo.ui.getMinLat()) * win.height),
		};
		return xy;
	},

	getXYDist: function(pt1, pt2) {
		var dist = Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
		return dist;
	},

	getGeoDist: function(geo1, geo2) {
		var dist = Math.sqrt(Math.pow(geo2.lon - geo1.lon, 2) + Math.pow(geo2.lat - geo1.lat, 2));
		return dist;
	},

	xyToGeo: function(x, y) {
		if (!y) {
			y = x.y;
			x = x.x;
		}
		var geo = { 
			lon: demo.ui.getMinLon() + (x / win.width * demo.ui.getLonWidth()),
			lat: demo.ui.getMinLat() + ((win.height - y) / win.height * demo.ui.getLatHeight()),
		};
		return geo;
	},

	vectorToRadians: function(vector, precision) {
		if (precision == null) { precision = 3; }
		var rad = (Math.atan(vector.y / vector.x)).toFixed(precision);
		return parseFloat(rad);
	},

	radiansToDegrees: function(rad, precision) {
		if (precision == null) { precision = 1; }
		return (360 * (rad / (2*Math.PI))).toFixed(precision);
	},

	Colors: {
		RED: "rgba(176, 128, 128, 0.9)",
		DARKRED: "rgba(176, 0, 0, 0.9)",
		WHITE: "rgba(255, 255, 255, 0.9)",
		BROWN: "rgba(65, 13, 0, 0.9)",
		YELLOW: "rgba(216, 189, 48, 0.9)",
		BRIGHTYELLOW: "rgba(240, 230, 80, 0.9)",
		BLUE: "rgba(42, 81, 124, 0.9)",
		Poly: {
			RED : "rgba(200, 0, 0, 0.3)",
			SOLIDRED : "rgba(200, 0, 0, 1.0)",
			DARKRED : "rgba(120, 0, 0, 0.5)",
			BRIGHTRED : "rgba(255, 0, 0, 0.9)",
			PINK : "rgba(255, 160, 160, 0.3)",
			YELLOW : "rgba(220, 220, 0, 0.2)",
			SOLIDYELLOW : "rgba(220, 220, 0, 1.0)",
			DARKYELLOW : "rgba(200, 200, 0, 0.3)",
			GREEN : "rgba(0, 120, 0, 0.3)",
			BRIGHTGREEN : "rgba(0, 255, 0, 0.9)",
			BLUE : "rgba(0, 0, 180, 0.25)",
			BROWN : "rgba(139, 69, 19, 0.4)",
			DARKBROWN : "rgba(139, 69, 19, 0.8)",
			WHITE : "rgba(255, 255, 255, 0.7)"
		}
	}
}


/******************************
 *                            *
 *      Demo                  *
 *                            *
 ******************************/
function Demo() {
	this.ui = new UI(this);
	this.id = Utils.randomUppercaseString(3);
	this.mqttclient = new MQTTClient(this.id);
	this.mapObjects = {};
}

Demo.prototype.init = function() {
	this.ui.updateViewport();
	this.ui.init();

	// add map objects to the demo
	this.addMapObject("MapGraphs", new MapGraphSet());
	var carSet = new MapObjectSet();
	carSet.init();

	this.addMapObject("Cars", carSet);
	this.addMapObject("Fence", new FenceSet());


}

Demo.prototype.addMapObject = function(name, objectType) {
	this.mapObjects[name] = objectType;
	this.mapObjects[name].type = name;
}

Demo.prototype.connect = function() {
	this.mqttclient.connect();
}

Demo.prototype.updateObjects = function() {
	for (var i in this.mapObjects) {
		this.mapObjects[i].update();
	}
}

Demo.prototype.drawMapObjects = function() {

	for (var i in this.mapObjects) {
		if (this.mapObjects[i].type!="Fence")
			this.mapObjects[i].draw();
	}
}

Demo.prototype.drawMapObjectOverlays = function() {
	for (var i in this.mapObjects) {
		this.mapObjects[i].drawOverlays();
	}
}

Demo.prototype.drawBackgroundMapPolygons = function() {
	for (var i in this.mapPolygons) {
		if (this.mapPolygons[i].isBackground()) {
			this.mapPolygons[i].draw();
		}
	}
	var fences = this.getFences();
	for (var i in fences) {
		if (fences[i].polygon) { 
			fences[i].polygon.draw();
		}
	}
}

Demo.prototype.draw = function() {
	this.ui.trackSelected();
	this.ui.context.clearRect(0, 0, demo.ui.canvas.width, demo.ui.canvas.height);
	this.drawBackgroundMapPolygons();
	this.drawMapObjects();
	this.drawMapObjectOverlays();

	if (this.ui.selectedObj) { this.ui.selectedObj.draw(); }
	if (this.ui.selectedObj) { this.ui.selectedObj.drawOverlay(); }
}

Demo.prototype.getCar = function(id) {
	return (this.mapObjects.Cars.objects[id] || null);
}

Demo.prototype.getFence = function(id) {
	return demo.mapObjects["Fence"].objects[id];
}

Demo.prototype.getFences = function() {
	return demo.mapObjects["Fence"].objects;
}

Demo.prototype.getNextFenceID = function() {
	for (var i = 1; i <= 25; i++) {
		var alreadyTaken = false;
		for (var j in demo.mapObjects["Fence"].objects) {
			if (demo.mapObjects["Fence"].objects[j].id == i) {
				alreadyTaken = true;
			}
		}
		if (!alreadyTaken) { return i; }
	}
	// this is an error
	return -1;
}

Demo.prototype.createFence = function() {
	this.mapObjects["Fence"].createFence();
}
//
//Traffic simulation: create fences for traffic zone types
//
Demo.prototype.createFenceOfType = function(zoneType) {
	var id = this.mapObjects["Fence"].createFence();
	this.mapObjects["Fence"].setZoneType(id, zoneType);
}
Demo.prototype.createCommercialFence = function() {
	this.createFenceOfType("Commercial");
}
Demo.prototype.createIndustrialFence = function() {
	this.createFenceOfType("Industrial");
}
Demo.prototype.createResidentialFence = function() {
	this.createFenceOfType("Residential");
}
Demo.prototype.createConstructionFence = function() {
	this.createFenceOfType("Construction");
}


Demo.prototype.clearFence = function(id) {
	//remove the associated traffic zone
	this.removeTrafficZone(id);
	this.mapObjects["Fence"].deleteFence(id);
}

Demo.prototype.saveFence = function(id) {
	this.mapObjects["Fence"].saveFence(id);
	//add an associated traffic zone
	var fence = this.getFence(id);
	this.addTrafficZone(id, fence.geo.lon, fence.geo.lat, fence.getZoneType());
}
//Traffic simulation: save the fence for a traffic zone type
Demo.prototype.saveFenceOfType = function(id, zoneType) {
	this.mapObjects["Fence"].saveFence(id);
	this.mapObjects["Fence"].setZoneType(id, zoneType);
	var fence = this.getFence(id);
	this.addTrafficZone(id, fence.geo.lon, fence.geo.lat, zoneType);
}



//
//Traffic simulation: Traffic zones processing
//

var zones = [];
Demo.prototype.initZones=function() {
	var fencesInit = this.getFences();
	var fencesForDeletion = [];
	for (var i in fencesInit) {
		var fence = fencesInit[i];
		var fence_id = fence.getName();
		// not an accident zone
		if (fence_id.indexOf("Accident")==-1){
			zones.push(new Zone(fence.getName(), fence.geo.lon, fence.geo.lat, fence.getZoneType()));  
		} else {
			// mark fence for deletion if zone not found in DB
			fencesForDeletion.push(fence_id);
		}
	}
	// Remove zombie zones
	for (var i in fencesForDeletion) {
		this.clearFence(fencesForDeletion[i]);
	}
}

Demo.prototype.getZones=function() {
	if (zones.length == 0){
		this.initZones();
	}
	return zones;
}

Demo.prototype.getZone=function(name) {
	if (zones.length == 0){
		this.initZones();
	}
	for (var i in zones) {
		if (zones[i].getName() == name) {
			return zones[i];
		}
	}
	return null;
}


Demo.prototype.addTrafficZone=function(name, lng, lat, type) {
	if (zones.length == 0){
		this.initZones();
	}
	
	// remove any existing zone of the same name (Assume only one zone can exist for  a fence name)
	this.removeTrafficZone(name);

	// create a new zone
	var zone = new Zone(name, lng,lat, type);
	zones.push(zone);
	
	this.publishZoneData();
	
	return zone;
}

Demo.prototype.removeTrafficZone=function(name) {
	for (var i in zones) {
		if (zones[i].getName() == name) {
			zones.splice(i,1);
		}
	}
	this.publishZoneData();
	return;

}

Demo.prototype.setTrafficZoneType=function(name, val) {
	for (var i in zones) {
		if (zones[i].getName() == name) {
			zones[i].setType(val);
			// set the type of the associated fence
			demo.mapObjects["Fence"].setZoneType(name, val);
			this.publishZoneData();
			return;
		}
	}
}

Demo.prototype.getTrafficZoneType=function(name) {
	for (var i in zones) {
		if (zones[i].getName() == name) {
			return zones[i].getType();
		}
	}
	return "Default";
}

Demo.prototype.getTrafficZoneStatus=function(name) {
	for (var i in zones) {
		if (zones[i].getName() == name) {
			return zones[i].getStatus();
		}
	}
	return "";
}

Demo.prototype.publishZoneData = function() {

	var payload = [];
	for (var i in zones) {
		payload.push(zones[i].getSmallPublishPayload());
	}
	if (payload.length == 1) {
		Utils.publish(window.config.trafficZonesTopic, JSON.stringify(payload[0]));
	} else {
		Utils.publish(window.config.trafficZonesTopic, JSON.stringify(payload));
	}
		
}
//Generate traffic alert when vehicle exits a traffic zone
Demo.prototype.setVehicleExited= function(zoneName, vehicleId){
	
	var zone = this.getZone(zoneName); 
	if (zone){
		zone.setVehicleExited(vehicleId);
		var trafficAlertPayload = {"eventType":"Exit", "vehicleId":vehicleId, "trafficZone": zone.getPublishPayload() };
		Utils.publish(window.config.trafficAlertTopic, JSON.stringify(trafficAlertPayload));
	}
	
}

//Generate traffic alert when vehicle enters a traffic zone
Demo.prototype.setVehicleEntered= function(zoneName, vehicleId){
	var zone = this.getZone(zoneName); 
	if (zone){
		zone.setVehicleEntered(vehicleId);
		// don't send traffic alert for first 2 cars in an Accident zone (they are involved in the accident)
		if ((zone.getType() != "Accident") || (zone.getType() == "Accident" && zone.getNumberOfCars()>2 )){
			var trafficAlertPayload = {"eventType":"Entry", "vehicleId":vehicleId, "trafficZone": zone.getPublishPayload() };
			Utils.publish(window.config.trafficAlertTopic, JSON.stringify(trafficAlertPayload));
		}
	}
}

//
//Traffic simulation: Collision processing
//
var collisions = Array();

Demo.prototype.addCollision = function (collisionID){
	collisions.push(collisionID);
}

Demo.prototype.removeCollision = function (collisionID){
	for (var i in collisions) {
		if (collisions[i] == collisionID) {
			collisions.splice(i,1);
		}
	}
}

//Create an accident zone around collision
Demo.prototype.createCollisionFence = function(id, lng, lat) {
	this.mapObjects["Fence"].createCollisionFence(id,lng,lat);
	var zone = this.addTrafficZone(id,lng, lat, "Accident");
	zone.setCollisionOccurred(id);
}
//When a new collision occurs, create an accident zone 
Demo.prototype.setCollisionOccurred= function(vehicle1, vehicle2){
	var collisionID = vehicle1.customProps.collisionID;
	this.addCollision(collisionID);
	
	// if zone contains one of the vehicles, add collision to zone
	for (var i in zones) {
		var zone = zones[i];
		if (zone.containsVehicle(vehicle1.id) || zone.containsVehicle(vehicle2.id)){
			zone.setCollisionOccurred(collisionID);
		}
	}
	// create an accident zone around collision
	var lng = Number(vehicle1.lng);
	var lat = Number(vehicle1.lat);
	this.createCollisionFence(collisionID, lng, lat);

}
// When a collision is cleared, delete the accident zone
Demo.prototype.setCollisionCleared= function(vehicle1, vehicle2){
	var collisionID = vehicle1.customProps.collisionID;
	this.clearFence(collisionID);

	this.removeCollision(collisionID);
	// remove collision from any zones that contain it
	for (var i in zones) {
		var zone = zones[i];
		if (zone.containsCollision(collisionID)){
			zone.setCollisionCleared(collisionID);
		}
	}
}






/*****************************************************************************
 *                            
 *                              Zone
 *
 ****************************************************************************/
//
//Traffic simulation: model a traffic zone
//
function Zone(name, longitude, latitude, zoneType) {
	this.name = name;
	this.trafficDensity="";
	this.vehicles = [];
	this.numberOfCars=0;
	this.numberOfCollisions = 0;
	this.collisions = [];
	this.status = "accident-free zone";
	this.longitude = longitude;
	this.latitude = latitude;
	this.type = zoneType;

}

Zone.prototype.getName = function() {
	return this.name;
}


Zone.prototype.setTrafficDensity = function(val) {
	console.log("setting trafficDensity to " + val);
	this.trafficDensity = val;
}
Zone.prototype.getTrafficDensity = function() {
	return this.trafficDensity;
}


Zone.prototype.setType = function(val) {
	console.log("setting traffic zone type to " + val);
	this.type = val;
}

Zone.prototype.getType = function() {
	console.log("getting traffic zone type  ");
	return this.type;
}

Zone.prototype.setStatus = function(val) {
	this.status = val;
}

Zone.prototype.getStatus = function() {
	return this.status;
}

Zone.prototype.getNumberOfCars = function() {
	return this.numberOfCars;
}

Zone.prototype.getNumberOfCollisions = function() {
	this.numberOfCollisions = this.collisions.length;
	return this.numberOfCollisions;
}

Zone.prototype.containsVehicle = function( vehicleId){

	for (var i in this.vehicles) {
		if (this.vehicles[i] == vehicleId) {
			return true;
		}
	}
	return false;
}
// when a vehicle enters a zone
Zone.prototype.setVehicleEntered = function(val) {
	this.vehicles.push(val);
	this.numberOfCars = this.vehicles.length;
}
//when a vehicle exits a zone
Zone.prototype.setVehicleExited = function(val) {
	for (var i in this.vehicles) {
		if (this.vehicles[i] == val) {
			this.vehicles.splice(i,1);
			this.numberOfCars = this.vehicles.length;
			return;
		}
	}
}

Zone.prototype.containsCollision = function( collisionId){
	for (var i in this.collisions) {
		if (this.collisions[i] == collisionId) {
			return true;
		}
	}
	return false;
}
//when a collision occurs in a zone
Zone.prototype.setCollisionOccurred = function(collisionID) {
	this.collisions.push(collisionID);
	this.numberOfCollisions = this.collisions.length;
	this.setStatus("accident zone");
}
//when a collision in a zone is cleared
Zone.prototype.setCollisionCleared = function(collisionID) {
	for (var i in this.collisions) {
		if (this.collisions[i] == collisionID) {
			this.collisions.splice(i,1);
			this.numberOfCollisions = this.collisions.length;
			if (this.numberOfCollisions == 0)
				this.setStatus("accident-free zone");
			return;
		}
	}
}



Zone.prototype.getSmallPublishPayload = function() {
	return {
		name: this.name,
		type:this.type,
	};
}

Zone.prototype.getPublishPayload = function() {
	return {
		name: this.name,
		type:this.type,
		numberOfCars: this.numberOfCars,
		numberOfCollisions : this.numberOfCollisions,
		trafficDensity:this.trafficDensity,
		status: this.status,
		vehicles: this.vehicles,
		collisions: this.collisions,
		longitude: this.longitude,	
		latitude: this.latitude,	
	};
}
