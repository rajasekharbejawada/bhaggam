
function MQTTClient(id) {
	this.subscriptionList = {};

	this.iot_server = window.config.iot_deviceOrg+".messaging.internetofthings.ibmcloud.com";
	this.iot_port = 1883;
	this.iot_username = window.config.iot_apiKey;
	this.iot_password = window.config.iot_apiToken;
	this.iot_clientid = "a:"+window.config.iot_deviceOrg+":mapui" + id; 

	this.client = new Messaging.Client(this.iot_server, this.iot_port, this.iot_clientid);
	this.client.onMessageArrived = this.onMessage;
	this.client.onConnectionLost = function() { 
		console.log("disconnected!");
	}

	defineSubs();
	
}

MQTTClient.prototype.connect = function() {
	var connectOptions = new Object();
	connectOptions.cleanSession = true;
	connectOptions.useSSL = false;
	connectOptions.keepAliveInterval = 72000;
	connectOptions.userName = this.iot_username;
	connectOptions.password = this.iot_password;

	connectOptions.onSuccess = (function(me) {
		return function() { 
			console.log("connected!");
			demo.mqttclient.subscribe(Subscriptions.overlays);
			demo.mqttclient.subscribe(Subscriptions.geoAlerts);
			// Traffic simulation: subscribe to collision alerts
			demo.mqttclient.subscribe(Subscriptions.collisionAlerts);
			for (var i in demo.mapObjects) {
				me.subscribe(demo.mapObjects[i].sub);
			}
		}
	})(this);
	connectOptions.onFailure = function() { 
		console.log("error!");
	}

	this.client.connect(connectOptions);
}

MQTTClient.prototype.subscribe = function(sub) {
	if (!sub) { return; }
	// remove existing listener, if it hung around...
	if (this.subscriptionList[sub.topic]) { 
		this.subscriptionList[sub.topic] = null;
	}

	console.log("subscribing to " + sub.topic);
	this.client.subscribe(sub.topic, { onSuccess: function() { console.log("subscribed to: " + sub.topic); } });
	this.subscriptionList[sub.topic] = sub.onMessage;
}

MQTTClient.prototype.onMessage = function(msg) {
	for (var i in demo.mqttclient.subscriptionList) {
		demo.mqttclient.subscriptionList[i](msg);
	}
}


/******************************
 *                            *
 *  Subscription              * 
 *                            *
 ******************************/
function Subscription(topic, onMessage) {
	this.topic = topic;
	this.onMessage = onMessage;
}

var Subscriptions = {};
function defineSubs() {
	Subscriptions.overlays = new Subscription("iot-2/type/api/id/+/cmd/addOverlay/fmt/json", function(msg) {
		var pattern = "iot-2/type/api/id/[A-Za-z0-9]*/cmd/addOverlay/fmt/json";
		if (!msg.destinationName.match(pattern)) { return; }
		try {
			console.log(msg.payloadString);
			var data = JSON.parse(msg.payloadString);
			console.log(data);
			var id = data.id;
			var text = data.text;
			var fgColor = data.fgColor || "black"; 
			var bgColor = data.bgColor || "rgba(255,255,255,0.9)"; 
			var duration = data.duration || 3000;

			var c = demo.getCar(id);
			if (c) {
				c.addOverlay(text, duration, bgColor, fgColor);
			}
		} catch (e) { console.error(e.message); }
	});

	// Traffic simulation: process collision alerts
	var collisionTopic  = "iot-2/type/"+window.config.iot_deviceType+"/id/+/evt/collisionAlert/fmt/json";

	Subscriptions.collisionAlerts = new Subscription(collisionTopic, function(msg) {
		try {
			var data = JSON.parse(msg.payloadString);
			console.log(data);
			var vehicle1 = data.vehicle1;
			var vehicle2 = data.vehicle2;
			var eventType = data.eventType;
			var text = eventType;
			var fgColor = "white"; 
			var bgColor = "rgba(0,0,0,0.8)"; 
			var duration = 2000;
			var v1 = demo.getCar(vehicle1.id);
			var v2 = demo.getCar(vehicle2.id);
			if (v1 && v2) {

				if (eventType == "Collision occurred" ){
					demo.setCollisionOccurred(vehicle1, vehicle2);
				} else if (eventType == "Collision cleared"){
					demo.setCollisionCleared(vehicle1, vehicle2);
				}
				v1.addOverlay(text , duration, bgColor, fgColor);
			}
			
		} catch (e) { console.error(e.message); }
	});

	
	
	Subscriptions.geoAlerts = new Subscription(window.config.notifyTopic, function(msg) {
		if (!msg.destinationName.match(window.config.notifyTopic)) { return; }
		try {
			var data = JSON.parse(msg.payloadString);
			console.log(data);
			var id = data.deviceInfo.id;
			var text = data.eventType;
			var fgColor = "white"; 
			var bgColor = "rgba(0,0,0,0.8)"; 
			var duration = 2000;

			var fenceName = data.regionId;
			var eventType = data.eventType;
			
			var c = demo.getCar(id);
			if (c) {
				c.addOverlay(text, duration, bgColor, fgColor);
			}
			// Traffic simulation: process vehicle exit and entry
			switch (eventType) {
				case "Exit": 
					demo.setVehicleExited(fenceName, id);
					break;
				case "Entry":
					demo.setVehicleEntered(fenceName, id);
					break;
			}

		} catch (e) { console.error(e.message); }
	});
	
}
