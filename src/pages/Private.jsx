import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Private = () => {
    const [user, setUser] = useState(null);
    const [privateData, setPrivateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const storedUser = sessionStorage.getItem('user');
        
        if (!storedUser) {
            navigate('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            await fetchPrivateData();
        } catch (error) {
            console.error('Error:', error);
            sessionStorage.removeItem('user');
            navigate('/login');
        }
    };

    const fetchPrivateData = async () => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/private`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setPrivateData(data);
            } else {
                throw new Error('Not authorized');
            }
        } catch (error) {
            console.error('Error fetching private data:', error);
            setError('You are not authorized to view this page');
            sessionStorage.removeItem('user');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.BACKEND_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            sessionStorage.removeItem('user');
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="mb-0">Private Dashboard</h3>
                            <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}
                            
                            {user && (
                                <div className="mb-4">
                                    <h4>Welcome, {user.email}!</h4>
                                    <p className="text-muted">User ID: {user.id}</p>
                                    <p className="text-muted">
                                        Member since: {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            
                            {privateData && (
                                <div className="alert alert-success">
                                    <h5>🎉 Success! You're authenticated!</h5>
                                    <p><strong>{privateData.message}</strong></p>
                                    <p>{privateData.private_content}</p>
                                    <hr />
                                    <h6>Your User Information:</h6>
                                    <ul>
                                        <li>Email: {privateData.user.email}</li>
                                        <li>Active: {privateData.user.is_active ? 'Yes' : 'No'}</li>
                                        <li>Account Created: {new Date(privateData.user.created_at).toLocaleString()}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};