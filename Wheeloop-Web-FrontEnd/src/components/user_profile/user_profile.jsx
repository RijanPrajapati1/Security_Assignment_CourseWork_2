import { useEffect, useState } from "react";
import { FaRegWindowClose } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../navBar/navbar";
import axiosInstance from "../utils/axios";


function UserProfileView() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            console.error("User ID not found in local storage. Cannot fetch profile.");
            navigate("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                // FIX: Remove '/api' from the path. The axios baseURL already includes it.
                const response = await axiosInstance.get(`/cred/users/${userId}`);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user details:", error.response?.data || error.message);
                setUser(null);
            }
        };



        fetchUser();
    }, [userId, navigate]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");

        setUser(null);
        navigate("/");
    };

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
                    {/* Close Button */}
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
                        <button
                            onClick={handleGoBack}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <FaRegWindowClose size={24} />
                        </button>
                    </div>

                    {/* User Details */}
                    {user ? (
                        <div className="space-y-4">
                            <p className="text-lg font-medium text-gray-700"><strong>Name:</strong> {user.full_name}</p>
                            <p className="text-lg font-medium text-gray-700"><strong>Email:</strong> {user.email}</p>
                            <p className="text-lg font-medium text-gray-700"><strong>Phone:</strong> {user.phone_number}</p>
                            <p className="text-lg font-medium text-gray-700"><strong>Address:</strong> {user.address}</p>
                            <p className="text-lg font-medium text-gray-700"><strong>Role:</strong> {user.role}</p>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center">Loading user data...</p>
                    )}

                    {/* Buttons */}
                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
                        >
                            Sign Out
                        </button>
                        {/* NEW: Edit Profile button */}
                        <button
                            onClick={() => navigate(`/editprofile`)}
                            className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfileView;