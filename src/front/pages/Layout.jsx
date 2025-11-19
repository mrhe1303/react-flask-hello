import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

export const Layout = () => {
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
            await fetch('/api/logout', {
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
                    <NavLink className="navbar-brand" to="/">
                        My App
                    </NavLink>
                    
                    <div className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <span className="navbar-text me-3">
                                    Welcome, {user.email}
                                </span>
                                <NavLink className="nav-link" to="/private">
                                    Private Area
                                </NavLink>
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
                                <NavLink className="nav-link" to="/login">
                                    Login
                                </NavLink>
                                <NavLink className="nav-link" to="/signup">
                                    Sign Up
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main>
                <Outlet /> {/* ESTA ES LA CLAVE - renderiza los componentes hijos */}
            </main>
        </div>
    );
};