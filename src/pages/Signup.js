import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSignupUserMutation } from "../services/appApi";
import { AiFillPlusCircle } from "react-icons/ai";
import "./Login.css";
import "./Signup.css";
import defaultPic from "../assets/default-profile-picture.png";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signupUser, { isLoading, error }] = useSignupUserMutation();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const handleSignup = async(e) => {
        e.preventDefault();
        const url = await uploadImage(image)
        console.log(url)
        signupUser({ name, email, password, picture: url }).then(({ data }) => {
            console.log(data);
            navigate("/");
        });
    };

    const validateImg = (e) => {
        const file = e.target.files[0];
        if (file.size >= 10485760) {
            return alert("Max file size is 10Mb")
        }
        else {
            setImage(file);
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const uploadImage = async () => {
        const data = new FormData();
        data.append('file', image);
        data.append('upload_preset', 'oc1f4jwm');
        try {
            setUploadingImg(true);
            let res = await fetch("https://api.cloudinary.com/v1_1/dwl1sojec/image/upload", {
                method: 'post',
                body: data
            })
            const urlData = await res.json();
            setUploadingImg(false);
            return urlData.url
        }
        catch(e) {
            setUploadingImg(false)
            console.log(e)
        }
    }

    return (
        <div className="login-page">
            <div className="login-form-div">
                <Form
                    onSubmit={(e) => {
                        handleSignup(e);
                    }}
                >
                    <h1>Create an account</h1>
                    <div className="signup-pic-div">
                        <img src={imagePreview || defaultPic} className="signup-pic" alt="" />
                        <label
                            htmlFor="image-upload"
                            className="image-upload-label"
                        >
                            <AiFillPlusCircle className="add-picture" />
                        </label>
                        <input type="file" id="image-upload" hidden accept="image/png, image/jpeg" onChange={validateImg} />
                    </div>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Your Name"
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
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            value={password}
                        ></Form.Control>
                    </Form.Group>
                    <div className="d-grid gap-2">
                        <Button variant="dark" size="lg" type="submit">
                            {uploadingImg? 'SIGNING UP...' : "SIGN UP"}
                        </Button>
                    </div>
                    <div className="py-4">
                        <p className="text-center">
                            Already have an account?{" "}
                            <Link to="/login">Login</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Signup;
