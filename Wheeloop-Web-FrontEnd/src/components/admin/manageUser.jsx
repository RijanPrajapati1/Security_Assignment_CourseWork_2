import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Importing icons from react-icons
import axiosInstance from "../utils/axios"; // Import axiosInstance

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false); // Toggle state for editing
    const [isAdding, setIsAdding] = useState(false); // Toggle state for adding new user
    const [currentUser, setCurrentUser] = useState(null); // Store current user being edited
    const [newUser, setNewUser] = useState({ // Store new user data
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });

    // Fetch users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get("/cred/users");
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users", error);
            }
        };
        fetchUsers();
    }, []);

    // Handle search term change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Handle edit click, set the current user to be edited
    const handleEdit = (user) => {
        setCurrentUser({ ...user });
        setIsEditing(true); // Open the edit form
    };

    // Handle add user click
    const handleAdd = () => {
        setIsAdding(true); // Open the add user form
    };

    // Handle save action for editing
    const handleSave = async () => {
        try {
            const response = await axiosInstance.put(`/cred/users/${currentUser.id}`, currentUser); // Assuming PUT request for updating user
            const updatedUsers = users.map((user) =>
                user.id === currentUser.id ? currentUser : user
            );
            setUsers(updatedUsers);
            setIsEditing(false); // Close the edit form
            setCurrentUser(null); // Clear current user state
        } catch (error) {
            console.error("Error saving user", error);
        }
    };

    // Handle save action for adding a new user
    const handleAddSave = async () => {
        try {
            const response = await axiosInstance.post("/cred/users", newUser); // Assuming POST request for adding a new user
            setUsers([...users, response.data]);
            setIsAdding(false); // Close the add form
            setNewUser({ name: "", email: "", phone: "", address: "", password: "" }); // Reset new user form
        } catch (error) {
            console.error("Error adding user", error);
        }
    };

    // Inside ManageUsers component
    const handleDelete = async (userId) => {
        if (!userId) {
            console.log("No user ID provided for deletion");
            return;
        }

        try {
            await axiosInstance.delete(`/cred/users/${userId}`);
            const updatedUsers = users.filter((user) => user.id !== userId);
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(
        (user) =>
            (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-deepPurple">Manage Users</h2>

            {/* Search Bar */}
            <div className="flex items-center mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by user name or email"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {/* Add User Button */}


            </div>


            {/* Add User Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-primary">Add User</h3>

                        <label className="block mb-2 text-sm font-medium text-gray-600">Name</label>
                        <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Phone</label>
                        <input
                            type="text"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Address</label>
                        <input
                            type="text"
                            value={newUser.address}
                            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <div className="mt-6">
                            <button
                                onClick={handleAddSave}
                                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                            >
                                Save User
                            </button>
                            <button
                                onClick={() => setIsAdding(false)} // Close the modal
                                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal/Toggle */}
            {isEditing && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-primary">Edit User</h3>

                        <label className="block mb-2 text-sm font-medium text-gray-600">Name</label>
                        <input
                            type="text"
                            value={currentUser.full_name}
                            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            value={currentUser.email}
                            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Phone</label>
                        <input
                            type="text"
                            value={currentUser.phone_number}
                            onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Address</label>
                        <input
                            type="text"
                            value={currentUser.address}
                            onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            value={currentUser.password}
                            onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                            className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        />

                        <div className="mt-6">
                            <button
                                onClick={handleSave}
                                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setCurrentUser(null);
                                }} // Close the modal
                                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <table className="w-full table-auto mt-4 border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">User ID</th>
                        <th className="border px-4 py-2">Full Name</th>
                        <th className="border px-4 py-2">Email</th>
                        <th className="border px-4 py-2">Phone</th>
                        <th className="border px-4 py-2">Address</th>
                        <th className="border px-4 py-2">Password</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="border px-4 py-2">{user._id}</td> {/* Display User ID */}
                                <td className="border px-4 py-2">{user.full_name}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{user.phone_number}</td>
                                <td className="border px-4 py-2">{user.address}</td>
                                <td className="border px-4 py-2">{user.password}</td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-500 mr-5"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-500"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-4">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
