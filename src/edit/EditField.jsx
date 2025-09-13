// EditField.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import CustomerHeader from "../customer_side/components/CustomerHeader";
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
        <div className="min-h-screen bg-white">
            <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
            <main className="pt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-sm mx-auto">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit {labels[field]}</h2>

                            <Form>
                                <Form.Group className="mb-6">
                                    <Form.Control
                                        type={field === "birthday" ? "date" : "text"}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={`Enter ${labels[field].toLowerCase()}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {field === "username" && (
                                        <Form.Text className="text-xs text-gray-500 mt-1">
                                            This will be visible to others
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                        className="flex-1 py-2 text-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditField;