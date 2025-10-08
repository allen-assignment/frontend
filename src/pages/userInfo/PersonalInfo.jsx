import React from "react";
import { Container, Card, Image } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CustomerHeader from "../../customer_side/components/CustomerHeader";
import { useApp } from "../../shared/context/AppContext";
import "./PersonalInfo.css";
import "../profile/Profile.css";

const PersonalInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state: appState } = useApp();
    const userInfo = location.state?.userInfo || appState.currentUser;

    if (!userInfo) {
        return (
            <div className="min-h-screen bg-white">
                <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
                <div className="pt-16 flex justify-center items-center min-h-screen">
                    <div className="text-center">No user data available.</div>
                </div>
            </div>
        );
    }

    const goEdit = (field) => {
        navigate(`/customer/edit/${field}`, { state: { value: userInfo[field] } });
    };

    return (
        <div className="min-h-screen bg-white profile-page">
            <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
            <main className="pt-16">
                <div className="py-6">
                    <div className="dashboard-container">
                        {/* 用户头像和信息 */}
                        <div className="avatar-wrapper">
                            <Image
                                src={`https://i.pravatar.cc/150?u=a042581f4e29026704d${userInfo.id || userInfo.username}`}
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

                        {/* 个人信息卡片 */}
                        <Card
                            className="menu-card"
                            onClick={() => goEdit("username")}
                        >
                            Username: {userInfo.username}
                        </Card>
                        
                        <Card
                            className="menu-card"
                            onClick={() => goEdit("email")}
                        >
                            Email: {userInfo.email}
                        </Card>
                        
                        <Card
                            className="menu-card"
                            onClick={() => goEdit("birth_date")}
                        >
                            Birthday: {userInfo.birth_date || 'Not set'}
                        </Card>
                        
                        {userInfo.usertype === 1 && (
                            <Card
                                className="menu-card"
                                onClick={() => goEdit("taste_preferences")}
                            >
                                Taste Preferences: {userInfo.taste_preferences || 'Not set'}
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PersonalInfo;