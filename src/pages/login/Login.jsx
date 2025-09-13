import React, { useState } from 'react';
import {Form, Button, Card, Alert} from 'react-bootstrap';
import './Login.css';
import axios from 'axios';

function Login({ isLogin, onToggle }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [usertype, setUsertype] = useState(1);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (isLogin) {
                const res = await axios.post('http://localhost:8000/user/login', {
                    username,
                    password
                });
                setMessage(res.data.message);
            } else {
                const res = await axios.post('http://localhost:8000/user/register', {
                    username,
                    password,
                    email,
                    birth_date: birthDate,
                    usertype: parseInt(usertype)
                });
                setMessage(res.data.message);
            }
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Request failed';
            setError(errMsg);
        }
    };

    return (
        <Card className="auth-card">
            <Card.Body>
                <Card.Title className="text-center mb-4">
                    {isLogin ? 'Login' : 'Register'}
                </Card.Title>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {!isLogin && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            {/*<Form.Group className="mb-3">*/}
                            {/*    <Form.Select*/}
                            {/*        value={usertype}*/}
                            {/*        onChange={(e) => setUsertype(e.target.value)}*/}
                            {/*        required*/}
                            {/*    >*/}
                            {/*        <option value="1">Regular User</option>*/}
                            {/*        <option value="2">Admin</option>*/}
                            {/*    </Form.Select>*/}
                            {/*</Form.Group>*/}
                        </>
                    )}

                    <Button variant="primary" type="submit" className="w-100">
                        {isLogin ? 'Login' : 'Register'}
                    </Button>
                </Form>

                <div className="text-center mt-3 toggle-text">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <span onClick={onToggle}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
                </div>
            </Card.Body>
        </Card>
    );
}

export default Login;