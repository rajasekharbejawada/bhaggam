# Traffic simulator kit

## Introduction
This kit extends the [Connected Vehicle Starter Kit](https://hub.jazz.net/project/bryancboyd/iot-vehicle-geospatial-starter-kit/) by Bryan Boyd.

The extended connected vehicle simulator:
- Assigns varying speeds to cars, depending on the value of the **expectedSpeed** property
- Enables cars to reverse back, if the **reverse** property is **true**
- Detects accidents between two cars, and publishes **collision alerts**.

The extended map application:
- Enables the user to create traffic zones of different types (**Default**, **Residential**, **Commercial**, **Industrial** and **Construction**). Each traffic zone keeps track of the number of cars and accidents in it.
- Publishes **traffic alerts** when a car enters and exits a traffic zone. The **traffic alerts** detail the cars and accidents in the traffic zone
- Subscribes to **collision alerts** and creates temporary **Accident** zones around accidents


## Getting started
Refer to Step 1 in the tutorial [Build a smart traffic management app for connected cars using Watson
IoT Platform and Node-RED on Bluemix](https://hub.jazz.net/project/usiddiqu/trafficsim-usiddiqu/overview#https://hub.jazz.net/git/usiddiqu%252Ftrafficsim-usiddiqu/contents/master/tutorial_bluemix_smart_traffic_v1.2.pdf) for details on how to set up this kit.

Refer to Step 2 to understand the extensions implemented.

## Build a Smart Traffic Management app

The blog post [Smart traffic management for connected cars using Watson IoT and Node-RED on Bluemix](https://developer.ibm.com/bluemix/2016/05/23/smart-traffic-management-with-watson-iot-and-bluemix/)  provides an overview of the app.

The tutorial [Build a smart traffic management app for connected cars using Watson
IoT Platform and Node-RED on Bluemix](https://hub.jazz.net/project/usiddiqu/trafficsim-usiddiqu/overview#https://hub.jazz.net/git/usiddiqu%252Ftrafficsim-usiddiqu/contents/master/tutorial_bluemix_smart_traffic_v1.2.pdf) shows you how extend this kit to build a smart traffic management app in Bluemix using the Watson IoT platform and Node-RED. It also utilizes the following services: Geospatial Analytics, Business Rules, Insights for Weather and Watson AlchemyAPI.


## License 
The source code is available under the MIT license, which is in the LICENSE file in the root of the repository.