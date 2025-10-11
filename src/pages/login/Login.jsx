import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {Form, Button, Card, Alert} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { useApp } from '../../shared/context/AppContext';
import { tokenManager, userAPI } from '../../services/api';

function Login({isLogin = true, onToggle = null}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loadRecommendations } = useApp();
    
    // Add component loading logs - use useEffect to avoid duplicate logs
    useEffect(() => {
        console.log('Login component loaded', {
            isLogin,
            location: location.pathname,
            timestamp: new Date().toISOString()
        });
    }, []); // Empty dependency array, only execute once when component mounts
    
    // Internal state management for login/register toggle
    const [isLoginMode, setIsLoginMode] = useState(isLogin);
    
    // Determine if it's merchant login
    const isMerchantLogin = location.pathname.includes('/merchant');
    
    // Get redirect URL - use useMemo to avoid repeated calculations
    const redirectTo = useMemo(() => {
        const redirect = new URLSearchParams(location.search).get('redirect') 
            || (isMerchantLogin ? '/merchant' : '/customer');
        console.log('Calculate redirectTo:', redirect);
        return redirect;
    }, [location.search, isMerchantLogin]);
    
    // Form state - maintain team's concise style
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [usertype, setUsertype] = useState(1);
    const [merchantName, setMerchantName] = useState("");
    const [tastePreferences, setTastePreferences] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Handle post-login logic - use JWT decoding to get user information
    const processAuthentication = useCallback(async (authResponse) => {
        try {
            // 1. Store JWT token to localStorage
            if (!authResponse.token) {
                throw new Error('No token received');
            }
            
            // Use tokenManager to store token
            tokenManager.setToken(authResponse.token);
            // 2. Decode JWT token to get user information
            
            const decodedData = await tokenManager.decodeToken(authResponse.token);
            
            if (!decodedData || !decodedData.userinfo) {
                throw new Error('Token decoding failed');
            }
            
            const userinfo = decodedData.userinfo;
            console.log('Token decoded successfully:', userinfo);
            
                    // 3. Create user object from decoded token
                    const user = {
                        id: userinfo.user_id?.toString() || Date.now().toString(),
                        username: userinfo.username,
                        email: userinfo.user_email || email,
                        usertype: userinfo.user_type !== undefined ? parseInt(userinfo.user_type) : 1,
                        taste_preferences: userinfo.taste_preferences,
                        merchant_id: userinfo.merchant_id, // Merchant ID (only for merchant users)
                        merchant_name: userinfo.merchant_name // Merchant name (only for merchant users)
                    };

                    console.log('Merchant ID check:', {
                        merchant_id: user.merchant_id,
                        type: typeof user.merchant_id,
                        is_null: user.merchant_id === null,
                        is_undefined: user.merchant_id === undefined,
                        is_zero: user.merchant_id === 0,
                        condition_result: !user.merchant_id && user.merchant_id !== 0
                    });
            console.log('User type determination:', {
                user_type: userinfo.user_type,
                parsed_usertype: parseInt(userinfo.user_type),
                final_usertype: user.usertype,
                is_merchant: user.usertype === 0,
                is_customer: user.usertype === 1
            });
            
            // 4. Set login state
            login(user);
            
            // 5. Set has seen welcome page (show menu directly after login)
            localStorage.setItem('hasSeenWelcome', 'true');
            
            // 6. If regular user and has taste preferences, load recommended items
            if (user.usertype === 1 && user.taste_preferences) {
                console.log('User information:', {
                    userID: user.id,
                    username: user.username,
                    userType: user.usertype,
                    tastePreferences: user.taste_preferences
                });
                console.log('🔍 Starting to load recommended items...');
                try {
                    await loadRecommendations(user.taste_preferences, '1', 3);
                    console.log('Recommendation loading completed!');
                } catch (error) {
                    console.error('Failed to load recommendations:', error);
                }
            } else {
                console.log('User has no taste preferences or not regular user, skip recommendation loading:', {
                    userType: user.usertype,
                    tastePreferences: user.taste_preferences
                });
            }
            
            // 7. Navigate based on user type
            console.log('Ready to navigate:', {
                usertype: user.usertype,
                redirectTo: redirectTo,
                is_merchant: user.usertype === 0,
                is_customer: user.usertype === 1,
                merchant_id: user.merchant_id
            });
            
            // ⚠️ Use setTimeout to ensure React state update completes before navigation
            setTimeout(() => {
                if (user.usertype === 0) {
                    // Merchant user navigate to merchant dashboard
                    console.log('Merchant user, navigate to:', redirectTo);
                    console.log('Merchant info:', {
                        merchant_id: user.merchant_id,
                        merchant_name: user.merchant_name,
                        usertype: user.usertype
                    });
                    // Use redirectTo (already determined above based on path)
                    navigate(redirectTo);
                    
                } else {
                    // Regular user navigate to menu homepage
                    console.log('Regular user, navigate to menu homepage:', redirectTo);
                    navigate(redirectTo);
                }
            }, 100); // Delay 100ms to ensure state update completes
        } catch (error) {
            console.error('Failed to process login authentication:', error);
            setError('Login processing failed: ' + (error.message || 'Unknown error'));
            // Clean up potentially stored token
            tokenManager.removeToken();
        }
    }, [login, navigate, redirectTo, email, loadRecommendations]);

    // Form submission handling
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=====================================');
        console.log('Login form submission triggered!', { 
            username, 
            password: password ? '***' : 'empty',
            isLoginMode,
            isMerchantLogin,
            redirectTo,
            timestamp: new Date().toISOString()
        });
        console.log('=====================================');
        setMessage('');
        setError('');
        
        // Validate input
        if (!username || !password) {
            setError('Please enter username and password');
            alert('Please enter username and password');
            return;
        }
        

        try {
            if (isLoginMode) {
                // Login logic - use userAPI
                console.log('🔐 Starting login request...', { 
                    username,
                    apiUrl: 'http://localhost:8000/user/login'
                });
                
                const res = await userAPI.login({
                    username,
                    password
                });
                
                console.log('✅ Login response:', res);
                setMessage(res.message);
                
                // Handle post-login logic
                console.log('📋 Starting to process authentication...');
                await processAuthentication(res);
                console.log('✅ Authentication processing completed');
            } else {
                // Registration logic - use userAPI
                console.log('📝 Starting registration request...', { 
                    username,
                    apiUrl: 'http://localhost:8000/user/register'
                });
                
                console.log('Registration data:', {
                    username,
                    email,
                    merchantName,
                    tastePreferences: tastePreferences,
                    tastePreferencesString: tastePreferences.join(','),
                    birth_date: birthDate,
                    usertype: parseInt(usertype)
                });
                
                const res = await userAPI.register({
                    username,
                    password,
                    email,
                    merchantName,
                    tastePreferences: tastePreferences.join(','),
                    birth_date: birthDate,
                    usertype: parseInt(usertype)
                });
                setMessage(res.message);
                
                // After successful registration, switch to login mode, guide user to login again
                setTimeout(() => {
                    setIsLoginMode(true);
                    setMessage('Registration successful! Please login with your credentials.');
                    // Clear password field, let user re-enter
                    setPassword('');
                }, 1500);
            }
        } catch (err) {
            
            console.error('Error details:', {
                response: err.response?.data,
                status: err.response?.status,
                message: err.message
            });
            const errMsg = err.response?.data?.error || err.message || 'Request failed';
            setError(errMsg);
            alert('Login failed: ' + errMsg);  // Add alert to ensure user sees error
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

                <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                    className="form-control"
                                />
                            </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="form-control"
                        />
                    </div>

                    {!isLoginMode && (
                        <>
                            <div className="mb-3">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="mb-3">
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="mb-3 ms-1">
                                <div>
                                    <input
                                        type="radio"
                                        name="usertype"
                                        id="usertype-regular"
                                        value="1"
                                        checked={usertype === "1"}
                                        onChange={(e) => setUsertype(e.target.value)}
                                        required
                                        style={{ marginRight: '5px' }}
                                    />
                                    <label htmlFor="usertype-regular" style={{ marginRight: '20px' }}>Regular User</label>
                                    <input
                                        type="radio"
                                        name="usertype"
                                        id="usertype-merchant"
                                        value="0"
                                        checked={usertype === "0"}
                                        onChange={(e) => setUsertype(e.target.value)}
                                        style={{ marginRight: '5px' }}
                                    />
                                    <label htmlFor="usertype-merchant">Merchant</label>
                                </div>
                            </div>

                            {usertype === "0" && (
                                <div className="mb-1">
                                    <input
                                        type="text"
                                        placeholder="Merchant Name"
                                        value={merchantName}
                                        onChange={(e) => setMerchantName(e.target.value)}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            )}
                            {usertype === "1" && (
                                <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
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
                                </div>
                            )}
                        </>

                    )}

                    <button 
                        type="submit"
                        className="w-100 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        {isLoginMode ? 'Login' : 'Register'}
                    </button>
                </form>

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