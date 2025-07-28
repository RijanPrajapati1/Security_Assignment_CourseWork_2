// src/pages/EmailVerifiedPage.jsx

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const EmailVerifiedPage = () => {
    const location = useLocation();
    const [status, setStatus] = useState('verifying'); // Initial status
    const [message, setMessage] = useState('Processing your email verification...');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const verificationStatus = queryParams.get('status');
        const errorMessage = queryParams.get('message');

        if (verificationStatus === 'success') {
            setStatus('success');
            setMessage('Your email has been successfully verified and your account is created! You can now log in.');
        } else if (verificationStatus === 'error') {
            setStatus('error');
            setMessage(errorMessage || 'There was an issue verifying your email. Please try registering again.');
        } else if (verificationStatus === 'already_verified') {
            setStatus('info');
            setMessage('This email has already been verified. You can now log in!');
        } else {
            // If direct access or unexpected query params
            setStatus('info');
            setMessage('If you were expecting to verify your email, please ensure you clicked the latest link from your inbox.');
        }
    }, [location]);

    return (
        <div className="container mx-auto p-6 text-center mt-10 max-w-md bg-white rounded-lg shadow-md">
            {status === 'success' && (
                <h2 className="text-2xl font-bold text-green-600 mb-4">Verification Successful!</h2>
            )}
            {status === 'error' && (
                <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed!</h2>
            )}
            {status === 'info' && (
                <h2 className="text-2xl font-bold text-blue-600 mb-4">Information</h2>
            )}
            {status === 'verifying' && (
                <h2 className="2xl font-bold text-gray-600 mb-4">Verifying...</h2>
            )}
            <p className="text-gray-700 mb-6">{message}</p>
            <Link to="/" className="btn bg-primary hover:bg-primary/80 text-white px-5 py-2 rounded-lg">
                Go to Home / Login
            </Link>
        </div>
    );
};

export default EmailVerifiedPage;