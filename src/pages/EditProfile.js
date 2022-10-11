import "./EditProfile.css";
import React, { useContext, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../services/appApi";
import { AppContext } from "../context/appContext";
import { useSelector } from "react-redux";
import { AiFillPlusCircle } from "react-icons/ai";
import { useEditUserMutation } from "../services/appApi";
import defaultPic from "../assets/default-profile-picture.png";

function EditProfile() {
    const user = useSelector((state) => state.user);
    const id = user._id;
    const [picture, setPicture] = useState(user.picture);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [EditUser, { isLoading, error }] = useEditUserMutation();
    const navigate = useNavigate();
    const { socket } = useContext(AppContext);
    const [image, setImage] = useState(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [imagePreview, setImagePreview] = useState(user.picture);

    const handleEdit = async (e) => {
        e.preventDefault();
        const url = await uploadImage(image);
        console.log(url);

        EditUser({ id, name, email, picture: url }).then(({ data }) => {
            alert("Profile Updated!");
            navigate("/");
        });
    };

    const validateImg = (e) => {
        const file = e.target.files[0];
        if (file.size >= 10485760) {
            return alert("Max file size is 10Mb");
        } else {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "oc1f4jwm");
        try {
            setUploadingImg(true);
            let res = await fetch(
                "https://api.cloudinary.com/v1_1/dwl1sojec/image/upload",
                {
                    method: "post",
                    body: data,
                }
            );
            const urlData = await res.json();
            setUploadingImg(false);
            return urlData.url;
        } catch (e) {
            setUploadingImg(false);
            console.log(e);
        }
    };

    return (
        <div className="edit-page">
            <div className="edit-form-div">
                <Form
                    onSubmit={(e) => {
                        handleEdit(e);
                    }}
                >
                    <h1>EDIT PROFILE</h1>
                    <div className="edit-pic-div">
                        <img
                            src={imagePreview || defaultPic}
                            className="edit-pic"
                            alt=""
                        />
                        <label
                            htmlFor="image-upload"
                            className="image-upload-label"
                        >
                            <AiFillPlusCircle className="add-picture" />
                        </label>
                        <input
                            type="file"
                            id="image-upload"
                            hidden
                            accept="image/png, image/jpeg"
                            onChange={validateImg}
                        />
                    </div>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Name"
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            value={name}
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Email"
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            value={email}
                        ></Form.Control>
                    </Form.Group>
                    <div className="d-grid gap-2">
                        <Button variant="dark" size="lg" type="submit">
                            UPDATE
                        </Button>
                    </div>
                    <div className="py-4">
                        <p className="text-center">
                            <Link to="/">Back to home</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default EditProfile;
