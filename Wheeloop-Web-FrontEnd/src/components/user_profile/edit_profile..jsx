import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../Navbar/navbar";
import axiosInstance from "../utils/axios";

function EditProfileView() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        address: "",
    });

    const userId = localStorage.getItem("userId");

    // Fetch the current user data to pre-populate the form
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                toast.error("User ID not found. Please log in again.");
                navigate("/login");
                return;
            }
            try {
                const response = await axiosInstance.get(`/cred/users/${userId}`);
                const user = response.data;
                setFormData({
                    full_name: user.full_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    address: user.address,
                });
            } catch (error) {
                console.error("Error fetching user details for edit:", error);
                toast.error("Failed to load user data.");
            }
        };
        fetchUser();
    }, [userId, navigate]);

    const updateProfileMutation = useMutation({
        mutationFn: (updatedData) => {
            // We will need a PUT request to update the user data
            return axiosInstance.put(`/cred/users/${userId}`, updatedData);
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            navigate("/userprofile"); // Redirect back to the profile view
        },
        onError: (error) => {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile.");
        },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
    };

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
                        <button
                            onClick={() => navigate("/userprofile")}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            &times;
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition"
                            >
                                {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/userprofile")}
                                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProfileView;