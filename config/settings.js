

var config = {
	iot_deviceType: "Mqtt",     // TODO: replace with your deviceType
	iot_deviceOrg: "urbxh5",             // TODO: replace with your IoT Foundation organization
	iot_deviceSet: [               // TODO: replace with your registered device(s)
		{ deviceId: "Miraclecar", token: "12345678" }
	],
	iot_apiKey: "a-urbxh5-rvrt1jw9vw",    	// TODO: replace with the key for a generated API token
	iot_apiToken: "bvxszK*cbdcXd*pL(Y",  	// TODO: replace with the generated API token
	
	// these topics will be used by Geospatial Analytics
	notifyTopic: "iot-2/type/api/id/geospatial/cmd/geoAlert/fmt/json",
	inputTopic: "iot-2/type/vehicle/id/+/evt/telemetry/fmt/json",

	//
	// Traffic simulation
	//
	
	// Generated trafficAlerts will be published to this topic 
	trafficAlertTopic: "iot-2/type/api/id/traffic/cmd/trafficAlert/fmt/json",
	// List of traffic zones will be published to this topic 
	trafficZonesTopic: "iot-2/type/api/id/traffic/cmd/trafficZones/fmt/json",

};

try {
	module.exports = config;
} catch (e) { window.config = config; }
