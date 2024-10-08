import React, { Component } from 'react';
import { Joystick } from "react-joystick-component"
import Config from "../data/config"


class Teleoperation extends Component {
    state = {
        connected: false,
        ros: null,
        joystickData: null,  // Lưu vị trí joystick
    }

    constructor() {
        super();
        this.handleMove = this.handleMove.bind(this);
        this.handleStop = this.handleStop.bind(this);
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
            this.reconnect()
        }, 5000);
        this.state.ros.on("connection", () => {
            console.log("[Teleoperation]Connection established successfully");
            this.setState({ connected: true });
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
        // Polling interval để gửi liên tục vị trí joystick nếu nó không đổi
        this.joystickInterval = setInterval(() => {
            if (this.state.joystickData) {
                this.publishJoystickData(this.state.joystickData);
            }
        }, 100); // Gửi lại mỗi 100ms
    }

    componentWillUnmount() {
        clearInterval(this.joystickInterval); // Hủy polling khi component bị unmount
    }

    handleMove(event) {
        this.setState({ joystickData: event }); // Cập nhật vị trí joystick
        this.publishJoystickData(event);
    }

    handleStop() {
        this.setState({ joystickData: null }); // Dừng polling khi joystick dừng
        this.publishJoystickData({
            x: 0,
            y: 0,
        });
    }

    publishJoystickData(event) {
        var cmd_vel = new window.ROSLIB.Topic({
            ros: this.state.ros,
            name: Config.CMD_VEL_TOPIC,
            messageType: "geometry_msgs/msg/Twist",
        });
        var twist = new window.ROSLIB.Message({
            linear: {
                x: event.y / 100,
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z: event.x === 0 ? 0 : -event.x / 70,
            },
        });
        cmd_vel.publish(twist);
    }
    render() { 
        return ( <div style={{position : "fixed",  bottom : "100px", left : "67px" }}>
            
            <Joystick
            baseColor="darkGrey"
            stickColor="grey"
            move={this.handleMove}
            stop={this.handleStop}
            ></Joystick>
        </div> );
    }
}
 
export default Teleoperation;