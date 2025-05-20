// EditField.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./EditPage.css";

const labels = {
    username: "昵称",
    email: "邮箱",
    birthday: "生日",
};

const EditField = () => {
    const navigate = useNavigate();
    const { field } = useParams();
    const location = useLocation();
    const [value, setValue] = useState(location.state?.value || "");

    const handleSave = () => {
        alert(`${labels[field]} 已保存：${value}`);
        navigate(-1);
    };

    return (
        <Container fluid className="edit-page-container">
            <div className="edit-header">
                <span className="edit-back" onClick={() => navigate(-1)}>&lt;</span>
                <span className="edit-title">{labels[field]}</span>
                <Button variant="link" className="edit-save-btn" onClick={handleSave}>保存</Button>
            </div>

            <Form className="mt-3 px-3">
                <Form.Group>
                    <Form.Label className="text-muted">{labels[field]}</Form.Label>
                    <Form.Control
                        type={field === "birthday" ? "date" : "text"}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={`请输入${labels[field]}`}
                    />
                    {field === "username" && <Form.Text muted>设置后，其他人将看到你的昵称。</Form.Text>}
                </Form.Group>
            </Form>
        </Container>
    );
};

export default EditField;