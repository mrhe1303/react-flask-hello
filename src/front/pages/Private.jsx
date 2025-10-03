import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Private = () => {
    const [user, setUser] = useState(null);
    const [privateData, setPrivateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            
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
                console.error('Error parsing user data:', error);
                sessionStorage.removeItem('user');
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);

    const fetchPrivateData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/private`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setPrivateData(data);
            } else {
                
                sessionStorage.removeItem('user');
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching private data:', error);
            setError('Failed to fetch private data');
            sessionStorage.removeItem('user');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logout`, {
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
                                    <h5>Private Data</h5>
                                    <p>{privateData.message}</p>
                                    <pre>{JSON.stringify(privateData, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};