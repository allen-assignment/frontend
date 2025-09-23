import React, {useState} from 'react';
import {Form, Button, Card, Alert} from 'react-bootstrap';
import './Login.css';
import axios from 'axios';

function Login({isLogin, onToggle}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [usertype, setUsertype] = useState(1);
    const [merchantName, setMerchantName] = useState("");
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [tastePreferences, setTastePreferences] = useState([]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (isLogin) {
                // const res = await axios.post('http://192.168.50.205:8000/user/login',
                const res = await axios.post('http://localhost:8000/user/login',
                    {
                        username,
                        password
                    });
                setMessage(res.data.message);
            } else {
                // const res = await axios.post('http://192.168.50.205:8000/user/register',
                const res = await axios.post('http://localhost:8000/user/register',
                    {
                        username,
                        password,
                        email,
                        merchantName,
                        tastePreferences,
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
                                <Form.Group style={{ marginTop: '4px', marginBottom: '4px' }}>
                                    <h6 className="form-label">Preferences</h6>
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
                                                style={{
                                                    fontSize: '13px',
                                                    padding: '0.15rem 0.4rem',
                                                    minHeight: '32px',
                                                    transition: 'none'
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