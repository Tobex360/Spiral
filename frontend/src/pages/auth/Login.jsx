import React, { useState } from 'react'
import { Input, Button, message, Form, Card, Typography, Row, Col, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import User from "../../assets/user.jpg";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined 
} from '@ant-design/icons';
import './login.css';
import axios from 'axios';
import AuthServices from '../../services/authServices';
import Password from 'antd/es/input/Password';

const { Title, Text } = Typography;

function Login() {

  const[loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) =>{
      console.log("Form values being sent:", values);
    setLoading(true);
    try{
  
    const response = await AuthServices.loginUser(values);
    localStorage.setItem('user', JSON.stringify(response.data));
    window.dispatchEvent(new Event('authChange'));
    message.success("User Logged In");
    navigate('/home');
    }catch(err){
      
      console.log(err);
      message.error("Invalid username or password");
    } finally{
      setLoading(false)
    }
  }
  return (
    <div className="login-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <Card 
        className="auth-card bg-secondary border-secondary font-audiowide" 
        style={{ maxWidth: 500, width: '100%', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
      >
        {/* Header Section with Centered Image */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '3px solid #ED1C24'
            }}>
              <img 
                src={User} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
          <Title level={3} style={{ marginBottom: '4px', color: ' #ED1C24'}}>Login</Title>
        </div>

        <Form layout="vertical" size="large" requiredMark={false} onFinish={handleSubmit}>

          <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }]}>
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Username" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Password" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ 
                height: '50px', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                fontSize: '16px',
                background: '#ED1C24',
                border: 'none'
              }}
            >
              Login
            </Button>
          </Form.Item>
          {/* <Form.Item>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => message.error("Google Login Failed")}
                theme="outline"
                size="large"
                text="signin_with"
              />
            </div>
          </Form.Item> */}

          <div style={{ textAlign: 'center', color: '#ED1C24'}}>
            <div>
              Dont have an account? <Link to="/register" style={{ color: 'white', fontWeight: '600' }}>Register</Link>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login