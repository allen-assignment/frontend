import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Card, Image, Spinner, Alert } from "react-bootstrap";
import CustomerHeader from "../../customer_side/components/CustomerHeader";
import "./Profile.css";
import PersonalInfo from "../userInfo/PersonalInfo";
import EditField from "../../edit/EditField";
import OrderHistory from "../orderhistory/OrderHistory";
import { userAPI } from "../../services/api";

const ProfileDashboard = ({ userId }) => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        console.log('Profile useEffect - loading user info from token');
        // Get user info from token (no need to pass userId)
        userAPI.getUserById()
            .then((res) => {
                console.log('Profile - user data loaded:', res);
                setUserInfo(res);
            })
            .catch((error) => {
                console.error('Profile - failed to load user info:', error);
                setError("Failed to load user info.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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
                                src={`https://i.pravatar.cc/150?u=a042581f4e29026704d${userInfo?.id || userInfo?.username || userId}`}
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