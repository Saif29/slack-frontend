import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { useState } from "react";
import { AppContext, socket } from "./context/appContext";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

function App() {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState({});
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [privateMemberMsg, setPrivateMemberMsg] = useState({});
    const [newMessages, setNewMessages] = useState({});

    return (
        <AppContext.Provider
            value={{
                socket,
                rooms,
                setRooms,
                currentRoom,
                setCurrentRoom,
                members,
                setMembers,
                messages,
                setMessages,
                privateMemberMsg,
                setPrivateMemberMsg,
                newMessages,
                setNewMessages,
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Chat />} />
                    <Route path="/edit" element={<EditProfile />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
