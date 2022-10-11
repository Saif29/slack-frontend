import React, { useContext, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../services/appApi";
import { AppContext } from "../context/appContext";
import './Login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginUser, { isLoading, error }] = useLoginUserMutation();
    const navigate = useNavigate();
    const { socket } = useContext(AppContext);

    const handleLogin = (e) => {
        e.preventDefault();
        loginUser({ email, password }).then(({ data }) => {
            if (data) {
                socket.emit("new-user");
                navigate("/");
            }
        });
    };

    return (
        <div className="login-page">
            <div className="login-form-div">
                <Form
                    onSubmit={(e) => {
                        handleLogin(e);
                    }}
                >
                    <h1>LOGIN</h1>
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
                            LOGIN
                        </Button>
                    </div>
                    <div className="py-4">
                        <p className="text-center">
                            Don't have an account?{" "}
                            <Link to="/signup">Signup</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default Login;
