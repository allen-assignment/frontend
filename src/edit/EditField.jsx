// EditField.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {Form, Button} from "react-bootstrap";
import CustomerHeader from "../customer_side/components/CustomerHeader";
import "./EditPage.css";
import {userAPI} from "../services/api";
import { useApp } from "../shared/context/AppContext";

const labels = {
    username: "Username",
    email: "Email",
    birthday: "Birthday",
    birth_date: "Birthday",
    taste_preferences: "Taste Preferences",
};

const EditField = () => {
    const navigate = useNavigate();
    const { field } = useParams();
    const location = useLocation();
    
    // Handle initialization of taste_preferences field
    const initialValue = field === 'taste_preferences' 
        ? (location.state?.value ? location.state.value.split(',') : [])
        : (location.state?.value || "");
    
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const { state: appState, dispatch } = useApp();


    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updateData = {};

            switch (field) {
                case 'username':
                    updateData.update_username = value;
                    break;
                case 'email':
                    updateData.update_email = value;
                    break;
                case 'birthday':
                case 'birth_date':
                    updateData.update_birth_date = value;
                    break;
                case 'taste_preferences':
                    break;
                default:
                    break;
            }
            const response = await userAPI.updateUserInfo(updateData);

            const displayValue = field === 'taste_preferences'
                ? (Array.isArray(value) ? value.join(', ') : value)
                : value;

            const updatedUser = { ...appState.currentUser };
            if (field === 'taste_preferences') {
                updatedUser[field] = Array.isArray(value) ? value.join(',') : value;
            } else {
                updatedUser[field] = value;
            }
            console.log('Updating context with:', updatedUser);
            dispatch({ type: 'SET_USER', payload: updatedUser });

            navigate(-1);

        } catch (error) {
            console.error('Failed to update user info:', error);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-white">
            <CustomerHeader showLoginButtons={true} isLoggedIn={true} />
            <main className="pt-16">
                <div className="py-8">
                    <div className="max-w-sm mx-auto">
                        <div className="  border border-gray-200 p-6 " style={{ backgroundColor: '#f0f0f4',borderRadius: '8px'}}>
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit {labels[field]}</h2>

                            <Form>
                                <Form.Group className="mb-6">
                                    {field === "taste_preferences" ? (
                                        <div>
                                            <Form.Label className="form-label mb-3">Select your taste preferences:</Form.Label>
                                            <div className="preference-options d-flex flex-wrap gap-2">
                                                {[
                                                    { value: 'seafood', label: 'Seafood' },
                                                    { value: 'spicy', label: 'Spicy' },
                                                    { value: 'sour', label: 'Sour' },
                                                    { value: 'sweet', label: 'Sweet' },
                                                    { value: 'vegetarian', label: 'Vegetarian' },
                                                    { value: 'gluten-free', label: 'Gluten-free' },
                                                ].map((taste) => (
                                                    <button
                                                        key={taste.value}
                                                        type="button"
                                                        className={`btn ${Array.isArray(value) && value.includes(taste.value)
                                                            ? 'btn-primary'
                                                            : 'btn-outline-secondary'
                                                        } btn-sm`}
                                                        onClick={() => {
                                                            if (Array.isArray(value)) {
                                                                if (value.includes(taste.value)) {
                                                                    setValue(value.filter(pref => pref !== taste.value));
                                                                } else {
                                                                    setValue([...value, taste.value]);
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            fontSize: '13px',
                                                            padding: '0.15rem 0.4rem',
                                                            minHeight: '32px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {taste.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Form.Control
                                            type={field === "birthday" || field === "birth_date" ? "date" : "text"}
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder={`Enter ${labels[field].toLowerCase()}`}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
                                        />
                                    )}
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