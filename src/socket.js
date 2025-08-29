import { io } from "socket.io-client";

const socket = io("https://ito-backend.onrender.com");
//const socket = io("http://localhost:4000");
//const socket = io("http://192.168.1.225:4000");

export default socket;
