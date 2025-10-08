import React, {useState, useCallback} from 'react';
import {Form, Button, Card, Alert} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { useApp } from '../../shared/context/AppContext';

function Login({isLogin = true, onToggle = null}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loadRecommendations } = useApp();
    
    // 内部状态管理登录/注册切换
    const [isLoginMode, setIsLoginMode] = useState(isLogin);
    
    // 获取重定向URL，默认为客户页面
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '/customer';
    console.log('当前页面路径:', location.pathname);
    console.log('redirectTo 参数:', redirectTo);
    
    // 表单状态 - 保持组员的简洁风格
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [usertype, setUsertype] = useState(1);
    const [merchantName, setMerchantName] = useState("");
    const [tastePreferences, setTastePreferences] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 处理登录后的逻辑 - 直接使用登录接口返回的数据
    const processAuthentication = useCallback(async (authResponse) => {
        // 创建用户对象并设置登录状态 - 直接使用登录接口返回的数据
        const user = {
            id: authResponse.user_id?.toString() || Date.now().toString(),
            username: authResponse.username,
            email: authResponse.user_email || email,
            usertype: authResponse.user_type !== undefined ? parseInt(authResponse.user_type) : parseInt(usertype),
            taste_preferences: authResponse.taste_preferences,
            merchant_id: authResponse.merchant_id, // 商户ID
            merchant_name: authResponse.merchant_name // 商户名称
        };
        
        console.log('登录响应数据:', authResponse);
        console.log('创建的用户对象:', user);
        console.log('用户类型判断:', {
            user_type: authResponse.user_type,
            parsed_usertype: parseInt(authResponse.user_type),
            final_usertype: user.usertype,
            is_merchant: user.usertype === 0,
            is_customer: user.usertype === 1
        });
        
        // 设置登录状态
        login(user);
        
        // 如果是普通用户且有口味偏好，加载推荐商品
        if (user.usertype === 1 && user.taste_preferences) {
            console.log('用户信息:', {
                用户ID: user.id,
                用户名: user.username,
                用户类型: user.usertype,
                口味偏好: user.taste_preferences
            });
            console.log('开始加载推荐商品...');
            try {
                await loadRecommendations(user.taste_preferences, '1', 5);
                console.log('推荐加载完成！');
            } catch (error) {
                console.error('Failed to load recommendations:', error);
            }
        } else {
            console.log('用户无口味偏好或非普通用户，跳过推荐加载:', {
                用户类型: user.usertype,
                口味偏好: user.taste_preferences
            });
        }
        
        // 根据用户类型跳转
        console.log('准备跳转:', {
            usertype: user.usertype,
            redirectTo: redirectTo,
            is_merchant: user.usertype === 0,
            is_customer: user.usertype === 1
        });
        
        if (user.usertype === 0) {
            // 商户用户始终跳转到商户页面，不管redirectTo是什么
            console.log('✅ 商户用户，跳转到 /merchant');
            console.log('🚀 执行 navigate("/merchant")');
            
            // 使用setTimeout确保状态更新后再跳转
            setTimeout(() => {
                console.log('延迟跳转到 /merchant');
                navigate('/merchant');
                console.log('navigate("/merchant") 已执行');
            }, 100);
        } else {
            // 普通用户跳转到客户页面
            console.log('普通用户，跳转到:', redirectTo);
            console.log('执行 navigate(redirectTo)');
            
            // 使用setTimeout确保状态更新后再跳转
            setTimeout(() => {
                console.log('延迟跳转到:', redirectTo);
                navigate(redirectTo);
                console.log('navigate(redirectTo) 已执行');
            }, 100);
        }
    }, [login, navigate, redirectTo, email, usertype, loadRecommendations]);

    // 表单提交处理
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (isLoginMode) {
                // 登录逻辑
                const res = await axios.post('http://localhost:8000/user/login',
                    {
                        username,
                        password
                    });
                setMessage(res.data.message);
                
                // 处理登录后的逻辑
                await processAuthentication(res.data);
            } else {
                // 注册逻辑
                const res = await axios.post('http://localhost:8000/user/register',
                    {
                        username,
                        password,
                        email,
                        merchantName,
                        tastePreferences: tastePreferences.join(','),
                        birth_date: birthDate,
                        usertype: parseInt(usertype)
                    });
                setMessage(res.data.message);
                
                // 注册成功后切换到登录模式，引导用户重新登录
                setTimeout(() => {
                    setIsLoginMode(true);
                    setMessage('Registration successful! Please login with your credentials.');
                    // 清空密码字段，让用户重新输入
                    setPassword('');
                }, 1500);
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
                    {isLoginMode ? 'Login' : 'Register'}
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

                    {!isLoginMode && (
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

                            <Form.Group className="mb-3 ms-1">
                                <div>
                                    <Form.Check
                                        inline
                                        label="Regular User"
                                        name="usertype"
                                        type="radio"
                                        id="usertype-regular"
                                        value="1"
                                        checked={usertype === "1"}
                                        onChange={(e) => setUsertype(e.target.value)}
                                        required
                                        style={{ marginRight: '20px' }}
                                        className="radio-spacing"
                                    />
                                    <Form.Check
                                        inline
                                        label="Merchant"
                                        name="usertype"
                                        type="radio"
                                        id="usertype-merchant"
                                        value="0"
                                        checked={usertype === "0"}
                                        onChange={(e) => setUsertype(e.target.value)}
                                        className="radio-spacing"
                                    />
                                </div>
                            </Form.Group>

                            {usertype === "0" && (
                                <Form.Group className="mb-1">
                                    <Form.Control
                                        type="text"
                                        placeholder="Merchant Name"
                                        value={merchantName}
                                        onChange={(e) => setMerchantName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            )}
                            {usertype === "1" && (
                                <Form.Group style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                                    <h7 className="form-label">What's your preferred flavor?</h7>
                                    <div className="preference-options">
                                        {[
                                            { value: 'seafood', label: 'seafood' },
                                            { value: 'spicy', label: 'spicy' },
                                            { value: 'sour', label: 'sour' },
                                            { value: 'sweet', label: 'sweet' },
                                            { value: 'vegetarian', label: 'vegetarian' },
                                            { value: 'gluten-free', label: 'gluten-free'},
                                        ].map((taste) => (
                                            <button
                                                key={taste.value}
                                                type="button"
                                                className={`btn ${tastePreferences.includes(taste.value)
                                                    ? 'btn-primary'
                                                    : 'btn-outline-secondary'
                                                } btn-sm`}
                                                onClick={(e) => {
                                                    if (tastePreferences.includes(taste.value)) {
                                                        setTastePreferences(tastePreferences.filter(pref => pref !== taste.value));
                                                    } else {
                                                        setTastePreferences([...tastePreferences, taste.value]);
                                                    }
                                                }}
                                            >
                                                {taste.label}
                                            </button>
                                        ))}
                                    </div>
                                </Form.Group>
                            )}
                        </>

                    )}

                    <button 
                        type="submit" 
                        className="w-100 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        {isLoginMode ? 'Login' : 'Register'}
                    </button>
                </Form>

                <div className="text-center mt-3 toggle-text">
                    {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <span 
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                    >
                        {isLoginMode ? 'Register here' : 'Login here'}
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
}

export default Login;