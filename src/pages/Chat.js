import React, { useEffect } from "react";
import MessageForm from "../components/MessageForm";
import Sidebar from "../components/Sidebar";
import Navigation from "../components/Navigation";
import "./Chat.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function Chat() {
    const user = useSelector((state) => state.user);

    return (
        <>
            {user ? (
                <>
                    <Navigation />
                    <div className="chat">
                        <div className="chat-sidebar">
                            <Sidebar />
                        </div>
                        <div className="chat-message-form">
                            <MessageForm />
                        </div>
                    </div>
                </>
            ) : (
                <Navigate to="/login" />
            )}
        </>
    );
}

export default Chat;
