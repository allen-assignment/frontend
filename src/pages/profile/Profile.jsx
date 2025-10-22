import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Card, Image, Spinner, Alert } from "react-bootstrap";
import CustomerHeader from "../../customer_side/components/CustomerHeader";
import "./Profile.css";
import PersonalInfo from "../userInfo/PersonalInfo";
import EditField from "../../edit/EditField";
import OrderHistory from "../orderhistory/OrderHistory";
import { useApp } from "../../shared/context/AppContext";

const ProfileDashboard = ({ userId }) => {
    const navigate = useNavigate();
    const { state, loadOrders } = useApp();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    console.log('Profile rendered, userInfo:', userInfo);

    useEffect(() => {
        console.log('Profile useEffect - using user info from AppContext');
        
        // AppContext already has the latest user data, just use it
        if (state.currentUser && state.isLoggedIn) {
            console.log('Profile - using user data from AppContext:', state.currentUser);
            // Convert AppContext User format to Profile expected format
            const profileUserInfo = {
                user_id: state.currentUser.id,
                username: state.currentUser.username,
                email: state.currentUser.email,
                birth_date: state.currentUser.birth_date,
                merchant_id: state.currentUser.merchant_id,
                merchant_name: state.currentUser.merchant_name,
                user_type: state.currentUser.usertype,
                taste_preferences: state.currentUser.taste_preferences
            };
            setUserInfo(profileUserInfo);
            setLoading(false);
        } else {
            // If no user data in AppContext, show loading
            console.log('Profile - waiting for AppContext to load user data...');
            setLoading(true);
            
            // Add timeout to prevent infinite loading - logout if no data
            const timeout = setTimeout(() => {
                if (!state.currentUser) {
                    console.error('Profile - timeout waiting for AppContext user data, logging out');
                    // Clear token and redirect to login
                    localStorage.removeItem('jwt_token');
                    window.location.href = '/customer/login';
                }
            }, 5000); // 5 second timeout
            
            return () => clearTimeout(timeout);
        }
    }, [state.currentUser, state.isLoggedIn]);

    if (loading) return (
        <div className="min-h-screen bg-white">
            <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
            <div className="pt-16 flex justify-center items-center min-h-screen">
                <Spinner animation="border" />
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-white">
            <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
            <div className="pt-16 flex justify-center items-center min-h-screen">
                <Alert variant="danger">{error}</Alert>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white profile-page">
            <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
            <main className="pt-16">
                <div className="py-6">
                    <div className="dashboard-container">
                        <div className="avatar-wrapper">
                            <Image
                                src={`https://i.pravatar.cc/150?u=${userInfo.user_id}`}
                                roundedCircle
                                width={60}
                                height={60}
                                className="avatar-img"
                            />
                            <div className="avatar-info">
                                <div className="avatar-name">{userInfo.username}</div>
                                <div className="avatar-phone">{userInfo.email}</div>
                            </div>
                        </div>

                        <Card
                            className="menu-card"
                            onClick={() => navigate("/customer/personal-info", { state: { userInfo } })}
                        >
                            Personal Information
                        </Card>
                        <div className="order-title-container">
                            <h5 className="order-title mb-3">Order History</h5>
                        </div>
                        <OrderHistory userId={userId} merchantId={userInfo?.merchant_id} />
                    </div>
                </div>
            </main>
        </div>
    );
};

const Profile = ({ userId }) => {
    return <ProfileDashboard userId={userId} />;
};

export default Profile;