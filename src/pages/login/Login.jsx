import React, { useState } from 'react';
import {Form, Button, Card, Alert} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { userAPI } from '../../services/api';
import { useApp } from '../../shared/context/AppContext';

function Login({ isLogin = true, onToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useApp();
    const [currentMode, setCurrentMode] = useState(isLogin);
    
    // 获取重定向URL，默认为客户页面
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '/customer';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [usertype, setUsertype] = useState(1);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleToggle = () => {
        setCurrentMode(!currentMode);
        setMessage('');
        setError('');
        if (onToggle) onToggle();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (currentMode) {
                const res = await userAPI.login({
                    username,
                    password
                });
                setMessage(res.message);
                
                // 登录成功后获取完整用户信息
                try {
                    const userInfo = await userAPI.getUserById(res.user_id);
                    
                    // 创建用户对象并设置登录状态
                    const user = {
                        id: userInfo.user_id?.toString() || res.user_id?.toString() || Date.now().toString(),
                        username: userInfo.username || res.username,
                        email: userInfo.email || '',
                        usertype: userInfo.usertype || 1
                    };
                    
                    // 设置登录状态
                    login(user);
                    
                    // 登录成功后跳转到重定向页面
                    if (user.usertype === 2) {
                        // 商家用户总是跳转到商家页面
                        navigate('/merchant');
                    } else {
                        // 普通用户跳转到重定向页面
                        navigate(redirectTo);
                    }
                } catch (userInfoError) {
                    console.error('Failed to get user info:', userInfoError);
                    // 如果获取用户信息失败，使用基本信息
                    const user = {
                        id: res.user_id?.toString() || Date.now().toString(),
                        username: res.username,
                        email: '',
                        usertype: 1
                    };
                    login(user);
                    navigate(redirectTo);
                }
            } else {
                const res = await userAPI.register({
                    username,
                    password,
                    email,
                    birth_date: birthDate,
                    usertype: parseInt(usertype)
                });
                setMessage(res.message);
                
                // 注册成功后自动登录
                try {
                    const userInfo = await userAPI.getUserById(res.user_id);
                    
                    // 创建用户对象并设置登录状态
                    const user = {
                        id: userInfo.user_id?.toString() || res.user_id?.toString() || Date.now().toString(),
                        username: userInfo.username || res.username,
                        email: userInfo.email || email,
                        usertype: userInfo.usertype || parseInt(usertype)
                    };
                    
                    // 设置登录状态
                    login(user);
                    
                    // 注册成功后跳转到重定向页面
                    if (user.usertype === 2) {
                        // 商家用户总是跳转到商家页面
                        navigate('/merchant');
                    } else {
                        // 普通用户跳转到重定向页面
                        navigate(redirectTo);
                    }
                } catch (userInfoError) {
                    console.error('Failed to get user info after registration:', userInfoError);
                    // 如果获取用户信息失败，使用基本信息
                    const user = {
                        id: res.user_id?.toString() || Date.now().toString(),
                        username: res.username,
                        email: email,
                        usertype: parseInt(usertype)
                    };
                    login(user);
                    navigate(redirectTo);
                }
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
                    {currentMode ? 'Login' : 'Register'}
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

                    {!currentMode && (
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
                                    placeholder="Birth Date"
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
                        {currentMode ? 'Login' : 'Register'}
                    </Button>
                </Form>

                <div className="text-center mt-3 toggle-text">
                    {currentMode ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <span onClick={handleToggle} style={{color: 'blue', cursor: 'pointer'}}>
                        {currentMode ? 'Register here' : 'Login here'}
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
}

export default Login;