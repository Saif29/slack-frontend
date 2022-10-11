import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLogoutUserMutation } from "../services/appApi";
import defaultPic from "../assets/default-profile-picture.png";
import "./Navigation.css";
import { useNavigate } from "react-router-dom";

function Navigation() {
    const user = useSelector((state) => state.user);
    const [navPicHover, setNavPicHover] = useState(false);
    const [showDrop, setShowDrop] = useState(false);
    const [logoutUser] = useLogoutUserMutation();
    const ref = useRef();
    const navigate = useNavigate();

    const handleHoverIn = () => {
        setNavPicHover(true);
    };

    const handleNavClick = () => {
        setShowDrop(true);
    };

    const handleHoverOut = () => {
        setNavPicHover(false);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        await logoutUser(user);
        window.location.replace("/login");
    };

    const handleEditProfile = () => {
        setShowDrop(false)
        navigate('/edit')
    }

    useEffect(() => {
        const checkIfClickedOutside = (e) => {
            if (showDrop && ref.current && !ref.current.contains(e.target)) {
                setShowDrop(false);
            }
        };
        document.addEventListener("mousedown", checkIfClickedOutside);
        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside);
        };
    }, [showDrop]);

    return (
        <div className="main-navbar">
            <div ref={ref} className="nav-wrap">
                <div className="nav-items-container">
                    <img
                        onMouseOver={handleHoverIn}
                        onMouseOut={handleHoverOut}
                        onClick={handleNavClick}
                        className="nav-img"
                        src={user.picture ? user.picture : defaultPic}
                        alt=""
                    />
                </div>
                <div
                    className={
                        navPicHover && !showDrop
                            ? "nav-hover-name-show"
                            : "nav-hover-name-hide"
                    }
                >
                    {user.name}
                </div>
                <div
                    className={
                        showDrop ? "nav-dropdown-show" : "nav-dropdown-hidden"
                    }
                >
                    <div>
                        <img
                            className="nav-img"
                            src={user.picture ? user.picture : defaultPic}
                            alt=""
                        />
                        {user.name}
                    </div>
                    <hr />
                    <div>
                        <button className="nav-btn" onClick={handleEditProfile}>
                            Edit Profile
                        </button>
                    </div>
                    <div>
                        <button className="nav-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navigation;
