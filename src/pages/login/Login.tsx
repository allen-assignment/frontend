import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

interface LoginProps {
  isLogin?: boolean;
  onToggle?: () => void;
  setIsLoggedIn?: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ isLogin = true, onToggle, setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoginMode, setIsLoginMode] = useState(isLogin);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      // 登录逻辑
      if (!formData.email || !formData.password) {
        setError('请填写所有必填字段');
        return;
      }

      try {
        // 模拟登录API调用
        if (formData.email === 'admin@example.com' && formData.password === 'admin123') {
          setIsLoggedIn && setIsLoggedIn(true);
          navigate('/merchant');
        } else if (formData.email === 'customer@example.com' && formData.password === 'customer123') {
          setIsLoggedIn && setIsLoggedIn(true);
          navigate('/customer');
        } else {
          setError('邮箱或密码错误');
        }
      } catch (err) {
        setError('登录失败，请重试');
      }
    } else {
      // 注册逻辑
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        setError('请填写所有必填字段');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }

      if (formData.password.length < 6) {
        setError('密码长度至少6位');
        return;
      }

      try {
        // 模拟注册API调用
        setError('注册成功！请登录');
        setIsLoginMode(true);
        setFormData({
          email: formData.email,
          password: '',
          confirmPassword: '',
          name: ''
        });
      } catch (err) {
        setError('注册失败，请重试');
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    onToggle && onToggle();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>{isLoginMode ? '登录' : '注册'}</h2>
          <p>{isLoginMode ? '欢迎回来！' : '创建新账户'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入您的姓名"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入您的邮箱"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入您的密码"
              required
            />
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn">
            {isLoginMode ? '登录' : '注册'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLoginMode ? '还没有账户？' : '已有账户？'}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLoginMode ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>

        <div className="demo-accounts">
          <h4>演示账户</h4>
          <div className="demo-account">
            <strong>商家端:</strong> admin@example.com / admin123
          </div>
          <div className="demo-account">
            <strong>客户端:</strong> customer@example.com / customer123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 