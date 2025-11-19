// Layout.jsx - Versión corregida
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Layout = ({ children }) => {
    const navigate = useNavigate();
    
    const getUser = () => {
        try {
            const userData = sessionStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    };
    
    const user = getUser();

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

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        My App
                    </Link>
                    
                    <div className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <span className="navbar-text me-3">
                                    Welcome, {user.email}
                                </span>
                                <Link className="nav-link" to="/private">
                                    Private Area
                                </Link>
                                <button 
                                    className="nav-link btn btn-link"
                                    onClick={handleLogout}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link" to="/login">
                                    Login
                                </Link>
                                <Link className="nav-link" to="/signup">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    );
};