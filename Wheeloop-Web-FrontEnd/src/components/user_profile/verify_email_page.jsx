import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // For notifications
import axiosInstance from '../utils/axios'; // Make sure this path is correct

function VerifyEmailPage() {
    const location = useLocation(); // Hook to get current URL information
    const navigate = useNavigate(); // Hook for navigation
    const [verificationStatus, setVerificationStatus] = useState('Verifying...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token'); // Get the 'token' query parameter from the URL

            if (!token) {
                setVerificationStatus('Error: Verification token not found in URL.');
                setLoading(false);
                toast.error('Verification token missing. Please ensure you clicked the full link.');
                return;
            }

            try {
                // Send the token to your backend's verification endpoint
                // Ensure this URL matches your backend route for email verification
                const response = await axiosInstance.get(`/cred/verify-email?token=${token}`);
                setVerificationStatus(response.data || 'Email verified successfully!');
                toast.success('Email verified successfully! You can now log in.');

                // Optional: Redirect to login page after a short delay
                setTimeout(() => {
                    navigate('/login'); // Redirect to your login page
                }, 3000); // Redirect after 3 seconds
            } catch (error) {
                console.error("Email verification failed:", error);
                const errorMessage = error.response?.data || 'Failed to verify email. Please try again.';
                setVerificationStatus(`Error: ${errorMessage}`);
                toast.error(`Verification failed: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [location.search, navigate]); // Rerun effect if URL search params change

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Email Verification</h2>
                {loading ? (
                    <div className="text-blue-600 text-lg">
                        <p>Processing your verification...</p>
                        <p className="mt-2">{verificationStatus}</p>
                    </div>
                ) : (
                    <div className={`text-lg ${verificationStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        <p>{verificationStatus}</p>
                        {!verificationStatus.includes('Error') && (
                            <p className="mt-4 text-gray-700">You will be redirected to the login page shortly.</p>
                        )}
                        {verificationStatus.includes('Error') && (
                            <button
                                onClick={() => navigate('/register')} // Or a different route for re-registration
                                className="mt-4 bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition"
                            >
                                Go to Registration
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;