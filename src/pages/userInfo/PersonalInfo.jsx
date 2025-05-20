import React from "react";
import { ListGroup, Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "./PersonalInfo.css";

const PersonalInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = location.state?.userInfo;

    if (!userInfo) {
        return <div className="text-center mt-5">No user data available.</div>;
    }

    const goEdit = (field) => {
        navigate(`/edit/${field}`, { state: { value: userInfo[field] } });
    };

    return (
        <Container fluid className="info-page-container">
            <div className="info-header" onClick={() => navigate(-1)}>
                <span className="back-arrow">←</span>
                <h4 className="info-title">Personal Information</h4>
            </div>

            <ListGroup variant="flush" className="info-list mt-3">
                <ListGroup.Item action onClick={() => goEdit("username")}>
                    Nickname <span className="item-value">{userInfo.username}</span>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => goEdit("email")}>
                    Email <span className="item-value">{userInfo.email}</span>
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => goEdit("birth_date")}>
                    Birthday <span className="item-value">{userInfo.birth_date}</span>
                </ListGroup.Item>
            </ListGroup>
        </Container>
    );
};

export default PersonalInfo;