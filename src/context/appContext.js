import { io } from "socket.io-client";
import React from "react";
import { baseDomain } from "../baseDomain";

const SOCKET_URL = baseDomain();

export const socket = io(SOCKET_URL);

export const AppContext = React.createContext();