import React, { Component } from 'react';
import Config from "../data/config"


class MapView extends Component {
    state = {
        connected: false,
        ros: null,
        isMap: false,
        navigator: null,
        viewer2: null,
        nav : null,
    } 

    constructor() {
        super();
        this.mapView = this.mapView.bind(this);
        this.state.ros = new window.ROSLIB.Ros();
        console.log(this.state.ros);
    }
    reconnect(){
        if(this.state.connected === false){
            console.log(this.state.connected);
            console.log('Reconnecting');
            try {
                try{
                    try {
                        this.state.ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`).onerror( function ( e){
                            console.log("Error caught by connect: ");
                            console.log(e);
                        });
                    } catch (error) {
                        console.log("Connection problem");
                    }
                   }catch(error){
                       console.log("Timesout Error");
                   }
            } catch (error) {
                console.log("Error");
            }
            
        }
    }
    init_connection() {
        window.onerror = function(e) {  
             console.log("error handled", e.type);
             console.log("error handled", e);
            };
        
        setInterval(() => {
            this.reconnect();
        }, 5000);

        this.state.ros.on("connection", () => {
            console.log("[map]Connection established successfully");
            this.setState({ connected: true });
            this.mapView();

        });
        this.state.ros.on("close", (error) => {
            console.log(error);
            console.log("Connection closed");
            this.setState({ connected: false });
        });
        
        try {
            this.state.ros.connect(`ws://${Config.ROSBRIDGE_SERVER_IP}:${Config.ROSBRIDGE_SERVER_PORT}`).onerror( function ( e){
                console.log("Error caught by connect: ");
                console.log(e);
            });
        } catch (error) {
            console.log("Connection problem");
        }
        
    }
    componentDidMount() {
        this.init_connection();
    }

    mapView() {
        if (this.state.connected === true) {
            try {
                this.viewer2 = new window.ROS2D.Viewer({
                    divID: 'nav',
                    width: 750,
                    height: 550
                });
    
                // Set up the occupancy grid for navigation
                this.state.nav = window.NAV2D.OccupancyGridClientNav({
                    ros: this.state.ros,
                    rootObject: this.viewer2.scene,
                    viewer: this.viewer2,
                    serverName: '/move_base',
                    topic: "/map"
                });

                
    
                // Subscribe to the odometry topic to get the robot's position
                // const odomListener = new window.ROSLIB.Topic({
                //     ros: this.state.ros,
                //     name: "/diff_cont/odom", 
                //     messageType: "nav_msgs/Odometry",
                // });
    
                // odomListener.subscribe((message) => {
                //     // Handle the odometry message and update the robot's position on the map
                //     this.updateRobotPosition(message);
                // });
    
                console.log("Nav setup complete");
            } catch (error) {
                console.log("Nav error");
                console.log(error);
            }
        }
    }
    
    // Method to update the robot's position on the map
    updateRobotPosition(message) {
        const position = message.pose.pose.position;
        const orientation = message.pose.pose.orientation;
    
        // Convert position to the viewer's coordinate system if necessary
        // Update the robot's position on the map
        // You can create a marker or an indicator for the robot position
        const robotMarker = new window.ROS2D.NavigationArrow({
            size: 1,
            strokeColor: '#00FF00',
            fillColor: '#00FF00',
            pulse: false
        });
    
        // Set the position of the marker
        robotMarker.x = position.x; // Convert to viewer coordinates if necessary
        robotMarker.y = position.y; // Convert to viewer coordinates if necessary
        robotMarker.rotation = this.getYawFromQuaternion(orientation);
    
        this.viewer2.scene.addChild(robotMarker);
    }
    
    // Function to convert quaternion to yaw angle
    getYawFromQuaternion(orientation) {
        const { x, y, z, w } = orientation;
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        return Math.atan2(siny_cosp, cosy_cosp);
    }
    
    
    render() { 
        return ( <div>
            <h3>Navigation Map</h3>
            <div id='nav'>
            </div>
            {
            }
        </div> );
    }
}
 
export default MapView;