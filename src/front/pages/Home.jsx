import React, { useState, useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
// import useGlobalReducer from "../hooks/useGlobalReducer.jsx"; // COMENTAR TEMPORALMENTE

export const Home = () => {
    const [message, setMessage] = useState(''); // Estado local temporal

    const loadMessage = async () => {
        try {
            const response = await fetch('/api/hello')
            const data = await response.json()

            if (response.ok) {
                setMessage(data.message)
            }

            return data

        } catch (error) {
            setMessage('Could not load message from backend')
            console.error('Error loading message:', error)
        }
    }

    useEffect(() => {
        loadMessage()
    }, [])

    return (
        <div className="text-center mt-5">
            <h1 className="display-4">Hello Rigo!!</h1>
            <p className="lead">
                <img src={rigoImageUrl} className="img-fluid rounded-circle mb-3" alt="Rigo Baby" />
            </p>
            <div className="alert alert-info">
                {message ? (
                    <span>{message}</span>
                ) : (
                    <span className="text-danger">
                        Loading message from the backend...
                    </span>
                )}
            </div>
            <div className="mt-4">
                <h3>Authentication System Ready!</h3>
                <p>Use the navigation above to Sign Up or Login</p>
            </div>
        </div>
    );
};