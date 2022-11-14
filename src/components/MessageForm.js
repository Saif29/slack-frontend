import React, { useContext, useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { AiOutlinePaperClip, AiFillFile } from "react-icons/ai";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import "./MessageForm.css";
import defaultPic from "../assets/default-profile-picture.png";
import { MdPersonAddAlt } from "react-icons/md";
import { RiTeamLine } from "react-icons/ri";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ColorRing } from "react-loader-spinner";
import Peer from "simple-peer";
import { BsFillTelephoneFill } from "react-icons/bs";

function MessageForm() {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState("");
    const [isFile, setIsFile] = useState(false);
    const [someoneTyping, setSomeoneTyping] = useState(false);
    const [typingName, setTypingName] = useState("");
    const [typingRoom, setTypingRoom] = useState("");
    const [fileName, setFileName] = useState("");
    const user = useSelector((state) => state.user);
    const {
        socket,
        currentRoom,
        setCurrentRoom,
        members,
        messages,
        setMessages,
        privateMemberMsg,
    } = useContext(AppContext);
    const messageEndRef = useRef(null);
    const [showViewMembers, setShowViewMembers] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMem, setNewMem] = useState("");
    const [showLoader, setShowLoader] = useState(false);

    const [isCall, setIsCall] = useState(false);
    const [callIncoming, setCallIncoming] = useState(false);
    const [isRinging, setIsRinging] = useState(false);
    const [otherUserOnCall, setOtherUserOnCall] = useState(null);

    const [mySocket, setMySocket] = useState(null);
    const [otherSocket, setOtherSocket] = useState(null);
    const [stream, setStream] = useState();
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        socket.emit("save-socket", user.email);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getFormattedDate = () => {
        const date = new Date();
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : "0" + month;
        let day = date.getDate().toString();
        day = day.length > 1 ? day : "0" + day;

        return month + "/" + day + "/" + year;
    };

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const todayDate = getFormattedDate();

    socket.off("room-messages").on("room-messages", (roomMessages) => {
        setMessages(roomMessages);
    });

    // socket.off("get-typing").on("get-typing", (typingName) => {
    //     setSomeoneTyping(typingName);
    // });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message) {
            const today = new Date();
            const minutes =
                today.getMinutes() < 10
                    ? "0" + today.getMinutes()
                    : today.getMinutes();
            const time = today.getHours() + ":" + minutes;
            const roomId = currentRoom;
            socket.emit("message-room", roomId, message, user, time, todayDate);
            setMessage("");
        }
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        const url = file;
        setShowLoader(false);
        if (url) {
            const today = new Date();
            const minutes =
                today.getMinutes() < 10
                    ? "0" + today.getMinutes()
                    : today.getMinutes();
            const time = today.getHours() + ":" + minutes;
            const roomId = currentRoom.name;
            socket.emit(
                "file-room",
                roomId,
                url,
                user,
                time,
                todayDate,
                isFile,
                message
            );
        } else {
            alert("Failed to upload!");
        }
        setFile("");
        setIsFile(false);
        setMessage("");
    };

    // const fileChangeHandler = async (e) => {
    //     e.preventDefault();
    //     setIsFile(true);
    //     const fileData = e.target.files[0];
    //     setFileName(fileData.name);
    //     setMessage(fileData.name);
    //     setFile(fileData);
    // };

    // const uploadFile = async () => {
    //     setShowLoader(true);
    //     const data = new FormData();
    //     data.append("file", file);
    //     data.append("upload_preset", "oc1f4jwm");
    //     data.append("resource_type", "raw");
    //     try {
    //         let res = await fetch(
    //             "https://api.cloudinary.com/v1_1/dwl1sojec/image/upload",
    //             {
    //                 method: "post",
    //                 body: data,
    //             }
    //         );
    //         const urlData = await res.json();
    //         return urlData.url;
    //     } catch (e) {
    //         console.log(e);
    //     }
    // };

    const handleTyping = () => {
        let typing = true;
        socket.emit("is-typing", typing, user, currentRoom.name);
    };

    const handleNotTyping = () => {
        let typing = false;
        setTimeout(
            () => socket.emit("is-typing", typing, user, currentRoom.name),
            3000
        );
        //socket.emit("is-typing", typing, user, currentRoom);
    };

    useEffect(() => {
        socket.on("show-typing", (typing, otherUser, room) => {
            setSomeoneTyping(typing);
            setTypingName(otherUser);
            setTypingRoom(room);
        });
    }, [socket]);

    const getRooms = async () => {
        await socket.emit("rooms-api");
    };

    const handleAddMemberClose = () => setShowAddMember(false);
    const handleAddMemberShow = () => setShowAddMember(true);
    const handleViewMembersClose = () => setShowViewMembers(false);
    const handleViewMembersShow = () => setShowViewMembers(true);

    const addMemberHandler = async () => {
        if (newMem != "") {
            let addedMem = await members.filter((x) => {
                return x._id == newMem;
            });
            addedMem = addedMem.at(0);
            handleAddMemberClose();
            await socket.emit("add-member", currentRoom.name, addedMem);
            socket.off("updated-room").on("updated-room", (room) => {
                setCurrentRoom(room);
            });
            setNewMem("");
        } else {
            alert("Select a user!");
        }
    };

    var widget = window.cloudinary.createUploadWidget(
        {
            cloudName: "dwl1sojec",
            uploadPreset: "oc1f4jwm",
        },
        (error, result) => {
            if (!error && result && result.event === "success") {
                let ext = result.info.public_id.substr(
                    result.info.public_id.lastIndexOf(".") + 1
                );
                let filename = result.info.original_filename + "." + ext;
                setMessage(filename);
                setFile(result.info.url);
                setIsFile(true);
            }
        }
    );

    const showWidget = (widget) => {
        widget.open();
    };

    useEffect(() => {
        const getUserMedia = async () => {
            const str = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true,
            });
            setStream(str);
            myVideo.current.srcObject = str;

            // await navigator.mediaDevices
            //     .getUserMedia({ video: false, audio: true })
            //     .then((stream) => {
            //         setStream(stream);
            //         myVideo.current.srcObject = stream;
            //     });
        };
        getUserMedia();
        socket.off("myId").on("myId", (id) => {
            setMySocket(id);
        });

        socket.off("call-user").on("call-user", (data) => {
            setOtherUserOnCall(data.from);
            setCallIncoming(true);
            setCaller(data.from_socket);
            setCallerSignal(data.signal);
        });
    }, []);

    // socket.off("get-socket").on("get-socket", () => {
    //     socket.emit("send-socket", mySocket, currentRoom.name);
    // });

    const callTo = async (room, person) => {
        setIsRinging(true);
        setCaller(person.socket)
        // await socket.emit("get-socket", person);
        // let y = null;
        // await socket.off("other-socket").on("other-socket", (s) => {
        //     setOtherSocket(s);
        //     y = s;
        // });
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });
        peer.on("signal", (data) => {
            socket.emit("call-user", {
                userToCall: person,
                signalData: data,
                from_user: user,
                from_socket: mySocket
            });
        });
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream;
        });
        await socket.off("call-accepted").on("call-accepted", (signal) => {
            setCallIncoming(false);
            setIsRinging(false);
            setIsCall(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = async () => {
        setCallIncoming(false);
        setIsRinging(false);
        setIsCall(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });
        peer.on("signal", (data) => {
            socket.emit("answer-call", { signal: data, to: caller });
        });
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream;
        });
        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    socket.off("ended-call").on("ended-call", () => {
        setIsCall(false);
        setIsRinging(false);
        setCallIncoming(false);
        alert("Call Ended!");
        connectionRef.current.destroy();
    });

    const leaveCall = () => {
        console.log("testt", caller)
        setIsCall(false);
        setIsRinging(false);
        setCallIncoming(false);
        alert("Call Ended!");
        socket.emit("end-call", caller);
    };

    return (
        <div className="message-portion">
            <div className="message-header">
                {isCall && <audio muted playsInline ref={myVideo} autoPlay />}
                {isCall && <audio playsInline ref={userVideo} autoPlay />}
                {currentRoom.name != undefined ? (
                    <>
                        {privateMemberMsg ? (
                            <div style={{ display: "flex" }}>
                                <div style={{ width: "95%" }}>
                                    <img
                                        src={
                                            privateMemberMsg.picture
                                                ? privateMemberMsg.picture
                                                : defaultPic
                                        }
                                        alt=""
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                        }}
                                    />{" "}
                                    {privateMemberMsg.name}<span style={{fontSize: "10px"}}>{privateMemberMsg.socket}</span>
                                </div>
                                {user._id !== privateMemberMsg._id && (
                                    <div
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            setOtherUserOnCall(
                                                privateMemberMsg
                                            );
                                            callTo(
                                                currentRoom,
                                                privateMemberMsg
                                            );
                                        }}
                                    >
                                        <BsFillTelephoneFill />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    width: "100%",
                                }}
                            >
                                <div className="room-name">
                                    <p>{`# ${currentRoom.name}`}</p>
                                    {currentRoom.isPrivate && (
                                        <div style={{ display: "flex" }}>
                                            <p
                                                style={{
                                                    fontSize: "x-small",
                                                    marginLeft: "10px",
                                                }}
                                            >
                                                (Private Room)
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "x-small",
                                                    marginLeft: "10px",
                                                }}
                                            >
                                                admin:{" "}
                                                {currentRoom.groupAdmin.name}
                                            </p>
                                        </div>
                                    )}
                                    <Modal
                                        show={showViewMembers}
                                        onHide={handleViewMembersClose}
                                        className="view-members-modal"
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title>
                                                ALL MEMBERS
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <ul>
                                                {currentRoom.members.map(
                                                    (m) => {
                                                        return (
                                                            <li key={m._id}>
                                                                {m.name}{" "}
                                                                {m._id ==
                                                                    currentRoom
                                                                        .groupAdmin
                                                                        ._id &&
                                                                    "(admin)"}{" "}
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </ul>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button
                                                variant="secondary"
                                                onClick={handleViewMembersClose}
                                            >
                                                Close
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                    <Modal
                                        show={showAddMember}
                                        onHide={handleAddMemberClose}
                                        className="add-member-modal"
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title>
                                                Add New Member
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <select
                                                value={newMem}
                                                onChange={(e) => {
                                                    setNewMem(e.target.value);
                                                }}
                                            >
                                                <option>Select User</option>
                                                {members.map((m) => {
                                                    return (
                                                        <option
                                                            key={m._id}
                                                            value={m._id}
                                                        >
                                                            {m.name}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <Button onClick={addMemberHandler}>
                                                Add
                                            </Button>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button
                                                variant="secondary"
                                                onClick={handleAddMemberClose}
                                            >
                                                Close
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </div>
                                {currentRoom.isPrivate && (
                                    <div className="private-room-head-btns">
                                        <div className="head-icon">
                                            <RiTeamLine
                                                onClick={handleViewMembersShow}
                                            />
                                        </div>
                                        {currentRoom.groupAdmin._id ===
                                            user._id && (
                                            <div className="head-icon">
                                                <MdPersonAddAlt
                                                    onClick={
                                                        handleAddMemberShow
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    ""
                )}
                {"  "}
            </div>
            <div className="message-output">
                {currentRoom.name != undefined ? (
                    <>
                        {showLoader && (
                            <div className="loader-modal" show="true">
                                <ColorRing
                                    visible={true}
                                    height="80"
                                    width="80"
                                    ariaLabel="blocks-loading"
                                    wrapperStyle={{}}
                                    wrapperClass="blocks-wrapper"
                                    colors={[
                                        "#222529",
                                        "#222529",
                                        "#222529",
                                        "#222529",
                                        "#222529",
                                    ]}
                                />
                            </div>
                        )}
                        {messages.length > 0 ? (
                            <>
                                {messages.map(
                                    ({ _id: date, messagesByDate }, idx) => {
                                        return (
                                            <div
                                                style={{ position: "relative" }}
                                                key={idx}
                                            >
                                                <hr />
                                                <div className="date-div">
                                                    <p className="date-text">
                                                        {date}
                                                    </p>
                                                </div>
                                                {messagesByDate.map(
                                                    (
                                                        {
                                                            content,
                                                            time,
                                                            from,
                                                            isFile,
                                                            fileName,
                                                        },
                                                        msg_idx
                                                    ) => {
                                                        return (
                                                            <div
                                                                className="message-row"
                                                                key={msg_idx}
                                                            >
                                                                <div className="message-img">
                                                                    <img
                                                                        src={
                                                                            from.picture
                                                                                ? from.picture
                                                                                : defaultPic
                                                                        }
                                                                    />
                                                                </div>
                                                                <div
                                                                    className={
                                                                        "message " +
                                                                        (from._id ===
                                                                        user._id
                                                                            ? "your-message"
                                                                            : "others-message")
                                                                    }
                                                                    key={
                                                                        msg_idx
                                                                    }
                                                                >
                                                                    <div className="message-details">
                                                                        <b>
                                                                            {
                                                                                from.name
                                                                            }
                                                                        </b>
                                                                        <p>
                                                                            {
                                                                                time
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    {isFile ? (
                                                                        <a
                                                                            href={`${content}`}
                                                                            target="_blank"
                                                                            className="file-link"
                                                                            download
                                                                        >
                                                                            <div className="file-div">
                                                                                <div className="file-div-row">
                                                                                    <div>
                                                                                        <AiFillFile className="file-icon" />
                                                                                    </div>
                                                                                    <div className="file-detail-div">
                                                                                        <p>
                                                                                            {
                                                                                                fileName
                                                                                            }
                                                                                        </p>
                                                                                        <p>
                                                                                            {fileName
                                                                                                .substr(
                                                                                                    fileName.lastIndexOf(
                                                                                                        "."
                                                                                                    ) +
                                                                                                        1
                                                                                                )
                                                                                                .toUpperCase()}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </a>
                                                                    ) : (
                                                                        <>
                                                                            <p>
                                                                                {
                                                                                    content
                                                                                }
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </>
                        ) : (
                            <div className="no-messages">
                                {privateMemberMsg ? (
                                    <>
                                        <h5>
                                            Start Chatting with{" "}
                                            <span style={{ color: "#1c80b0" }}>
                                                {privateMemberMsg.name}
                                            </span>{" "}
                                            now!
                                        </h5>
                                    </>
                                ) : (
                                    <>
                                        <h5>
                                            This is the very beginning of the{" "}
                                            <span style={{ color: "#1c80b0" }}>
                                                #{currentRoom.name}
                                            </span>{" "}
                                            channel
                                        </h5>
                                        <p>Start Chatting now!</p>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-messages">
                        <h5 style={{ textAlign: "center" }}>
                            Join a room to chat!
                        </h5>
                    </div>
                )}
                <div ref={messageEndRef}></div>
            </div>
            {someoneTyping && typingRoom == currentRoom.name && (
                <div
                    style={{
                        zIndex: 10,
                        position: "absolute",
                        bottom: "100px",
                        backgroundColor: "#1a1d21",
                        right: "20px",
                        padding: "1%",
                    }}
                >
                    <p>{typingName.name} is typing...</p>
                </div>
            )}
            {currentRoom.name != undefined && (
                <form
                    onSubmit={(e) =>
                        isFile ? handleFileSubmit(e) : handleSubmit(e)
                    }
                >
                    <div className="message-form-row">
                        <div className="message-input-div">
                            <input
                                type="text"
                                placeholder="Type Message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleTyping}
                                onKeyUp={handleNotTyping}
                            />
                        </div>
                        <div className="message-btn-div">
                            {/* <label htmlFor="file-upload">
                                <AiOutlinePaperClip className="file-upload-icon" />
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                hidden
                                onChange={(e) => fileChangeHandler(e)}
                            /> */}
                            <button
                                onClick={() => {
                                    showWidget(widget);
                                }}
                                className="file-upload-btn"
                                type="button"
                            >
                                <AiOutlinePaperClip className="file-upload-icon" />
                            </button>
                            <button className="message-btn" type="submit">
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </form>
            )}
            {isCall &&
                (
                    <Modal show={true} className="view-members-modal">
                        <Modal.Body>
                            <p style={{ fontSize: "25px" }}>
                                On Call with {otherUserOnCall && otherUserOnCall.name}
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="end-call-btn" onClick={leaveCall}>
                                End Call
                            </button>
                        </Modal.Footer>
                    </Modal>
                )}
            {isRinging && (
                <Modal show={true} className="view-members-modal">
                    <Modal.Body>
                        <p style={{ fontSize: "25px" }}>
                            Calling {otherUserOnCall && otherUserOnCall.name}
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="end-call-btn" onClick={leaveCall}>
                            End Call
                        </button>
                    </Modal.Footer>
                </Modal>
            )}
            {callIncoming && (
                <Modal show={true} className="view-members-modal">
                    <Modal.Body>
                        <p style={{ fontSize: "25px" }}>
                            {otherUserOnCall && otherUserOnCall.name} is
                            calling...
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="call-detail-accept">
                            <button
                                className="accept-call-btn"
                                onClick={answerCall}
                            >
                                Accept
                            </button>
                            <button
                                className="end-call-btn"
                                onClick={leaveCall}
                            >
                                Decline
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}

export default MessageForm;
