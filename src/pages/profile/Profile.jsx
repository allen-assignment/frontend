import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Card, Image, Spinner, Alert } from "react-bootstrap";
import "./Profile.css";
import PersonalInfo from "../userInfo/PersonalInfo";
import EditField from "../../edit/EditField";
import OrderHistory from "../orderhistory/OrderHistory";
import axios from "axios";

const ProfileDashboard = ({ userId }) => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get(`http://localhost:8000/user/getUserById?user_id=${userId}`)
            .then((res) => {
                setUserInfo(res.data);
            })
            .catch(() => {
                setError("Failed to load user info.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <Spinner animation="border" className="mt-5" />;
    if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

    return (
        <div className="dashboard-container">
            <div className="avatar-wrapper">
                <Image
                    src={`https://i.pravatar.cc/150?u=a042581f4e29026704d${userId}`}
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
                onClick={() => navigate("/personal-info", { state: { userInfo } })}
            >
                Personal Information
            </Card>
            <div className="order-title-container">
                <h5 className="order-title mb-3">Order History</h5>
            </div>
            <OrderHistory userId={userId} />
        </div>
    );
};

const DashboardWrapper = ({ userId }) => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<ProfileDashboard userId={userId} />} />
            <Route path="/personal-info" element={<PersonalInfo />} />
            <Route path="/edit/:field" element={<EditField />} />
        </Routes>
    </BrowserRouter>
);

const Profile = ({ userId }) => {
    return <DashboardWrapper userId={userId} />;
};

export default Profile;