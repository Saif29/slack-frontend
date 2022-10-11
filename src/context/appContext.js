import { io } from "socket.io-client";
import React from "react";

const SOCKET_URL = "http://localhost:3001";

export const socket = io(SOCKET_URL);

export const AppContext = React.createContext();