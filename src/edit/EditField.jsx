// EditField.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./EditPage.css";

const labels = {
    username: "Username",
    email: "Email",
    birthday: "Birthday",
};

const EditField = () => {
    const navigate = useNavigate();
    const { field } = useParams();
    const location = useLocation();
    const [value, setValue] = useState(location.state?.value || "");

    const handleSave = () => {
        alert(`${labels[field]} saved: ${value}`);
        navigate(-1);
    };

    return (
        <Container fluid className="edit-page-container">
            <div className="edit-header">
                <span className="edit-back" onClick={() => navigate(-1)}>&lt;</span>
                <span className="edit-title">{labels[field]}</span>
                <Button variant="link" className="edit-save-btn" onClick={handleSave}>Save</Button>
            </div>

            <Form className="mt-3 px-3">
                <Form.Group>
                    <Form.Label className="text-muted">{labels[field]}</Form.Label>
                    <Form.Control
                        type={field === "birthday" ? "date" : "text"}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={`Enter ${labels[field]}`}
                    />
                    {field === "username" && <Form.Text muted>Once set, others will see your username.</Form.Text>}
                </Form.Group>
            </Form>
        </Container>
    );
};

export default EditField;