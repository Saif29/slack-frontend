import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import { FaCircle, FaPlus, FaPlusCircle } from "react-icons/fa";
import "./Sidebar.css";
import defaultPic from "../assets/default-profile-picture.png";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";

function Sidebar() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    let arr = [];
    const [groupName, setGroupName] = useState("");
    const [mem, setMem] = useState([]);
    const [show, setShow] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        setIsPrivate(false);
    }, [show]);

    const {
        socket,
        rooms,
        setRooms,
        currentRoom,
        setCurrentRoom,
        members,
        setMembers,
        privateMemberMsg,
        setPrivateMemberMsg,
    } = useContext(AppContext);

    const joinRoom = (room, isPublic = true) => {
        socket.emit("join-room", room);
        setCurrentRoom(room);

        if (isPublic) {
            setPrivateMemberMsg(null);
        }
        // dispatch(resetNotifications(room.name));

        // socket.off("notifications").on("notifications", (room) => {
        //     dispatch(addNotifications(room));
        // });
    };

    socket.off("new-user").on("new-user", (payload) => {
        setMembers(payload);
    });

    socket.off("get-rooms").on("get-rooms", (updatedRooms) => {
        setRooms(updatedRooms);
    });

    useEffect(() => {
        if (user) {
            getRooms();
            socket.emit("new-user");
        }
    }, []);

    const getRooms = async() => {
        await socket.emit("rooms-api")
    };

    const orderIds = (id1, id2) => {
        if (id1 > id2) {
            return id1 + "-" + id2;
        } else {
            return id2 + "-" + id1;
        }
    };

    const handlePrivateMemberMsg = (member) => {
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        const currRoom = {name: roomId}
        joinRoom(currRoom, false);
    };

    async function onCreate(e) {
        e.preventDefault();
        if (rooms.indexOf(groupName) !== -1) {
            alert("Name already exists,Choose a different name!");
            return;
        }
        await socket.emit("add-group", groupName, user, isPrivate);
        getRooms();
        handleClose();
    }

    const isMember = (user, members) => {
        let y = false;
        members.map((u) => {
            //alert(u._id + ", " + user._id)
            if (u._id == user._id) {
                y = true;
            }
        });
        return y;
    };

    return (
        <div className="sidebar-div">
            <div className="sidebar-sub-div">
                <div className="sidebar-channel-head">
                    <h5>Channels</h5>
                    <span className="channel-plus-icon">
                        <FaPlus onClick={handleShow} />
                    </span>
                </div>
                <Modal
                    show={show}
                    onHide={handleClose}
                    className="channel-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Channel</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={onCreate}>
                            <Form.Group>
                                <Form.Control
                                    onChange={(e) =>
                                        setGroupName(e.target.value)
                                    }
                                    placeholder="Group Name"
                                ></Form.Control>
                            </Form.Group>
                            <br />
                            <Form.Group>
                                <input
                                    name="isPrivate"
                                    type="checkbox"
                                    onChange={(e) => {
                                        setIsPrivate(e.target.checked);
                                    }}
                                />
                                <label htmlFor="isPrivate">Private Room</label>
                            </Form.Group>

                            <br />
                            <div className="d-grid gap-2">
                                <Button type="submit" variant="secondary">
                                    Create
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <ul className="list-group">
                    {rooms.map((room, idx) => {
                        return (
                            <div key={idx}>
                                {(!room.isPrivate ||
                                    isMember(user, room.members)) && (
                                        <li
                                            className={
                                                room.name == currentRoom.name
                                                    ? "active"
                                                    : "list-item"
                                            }
                                            onClick={() => {
                                                joinRoom(room);
                                            }}
                                            style={{
                                                cursor: "pointer",
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            {"#"} {room.name}
                                        </li>
                                    )}
                            </div>
                        );
                    })}
                </ul>
            </div>
            <div className="sidebar-sub-div">
                <h5>Direct Messages</h5>
                <div className="list-group">
                    {members.map((member) => {
                        return (
                            <div
                                className={
                                    privateMemberMsg?._id == member?._id
                                        ? "active"
                                        : "list-item"
                                }
                                key={member._id}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    handlePrivateMemberMsg(member);
                                }}
                            >
                                <div className="list-img-status">
                                    <img
                                        src={
                                            member.picture
                                                ? member.picture
                                                : defaultPic
                                        }
                                        alt=""
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                        }}
                                    />
                                    {member.status == "online" ? (
                                        <FaCircle
                                            style={{
                                                color: "green",
                                                height: "12px",
                                            }}
                                            className="sidebar-online-status"
                                        />
                                    ) : (
                                        <FaCircle
                                            style={{
                                                color: "orange",
                                                height: "12px",
                                            }}
                                            className="sidebar-offline-status"
                                        />
                                    )}
                                </div>{" "}
                                {member.name}
                                {member._id === user._id && " (You)"}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
