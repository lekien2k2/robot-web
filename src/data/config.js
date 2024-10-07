const Config = {
    ROSBRIDGE_SERVER_IP: "115.73.215.28",
    ROSBRIDGE_SERVER_PORT: "9090",
    CMD_VEL_TOPIC: "/diff_cont/cmd_vel_unstamped",
    GOAL_TOPIC: "/move_base_simple/goal",
    VIDEO_STREAM_URL:
      "http://115.73.215.28:9090/stream?topic=/camera/rgb/image_raw&type=mjpeg&width=300&height=200",
  };
  
  export default Config;