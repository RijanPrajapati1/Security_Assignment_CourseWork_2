import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axios";

const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    console.log("Token on Mount:", token);

    if (token) {
      setLoggedIn(true);
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "customer") {
        // No immediate navigate for customer on initial load unless a specific home page
      }
    }
  }, [navigate]);

  const toggleLoginModal = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
    setIsSignupModalOpen(false); // Close signup modal
  };

  const toggleSignupModal = () => {
    setIsSignupModalOpen(!isSignupModalOpen);
    setIsLoginModalOpen(false); // Close login modal
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post("/cred/login", credentials);
      console.log("Stored Token:", localStorage.getItem("authToken"));
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Login Success:", data);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.userId)
      setLoggedIn(true);
      setIsLoginModalOpen(false);
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    },
    onError: (error) => {
      console.log("Login Error:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    },
  });

  const signupMutation = useMutation({
    mutationFn: (userData) => {
      console.log("Sending signup request", userData);
      return axiosInstance.post("/cred/register", userData);
    },
    onMutate: () => {
      toast.info("Processing your signup...", {
        toastId: "signupProcessing",
      });
    },
    onSuccess: (response) => {
      toast.dismiss("signupProcessing");
      console.log("Signup request successful (pending verification):", response.data);
      toast.success(response.data.message || "Registration successful! Please check your email to verify your account.");
      setIsSignupModalOpen(false);
    },
    onError: (error) => {
      toast.dismiss("signupProcessing");
      console.log("Signup Error:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    },
  });

  const handleLogin = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    loginMutation.mutate({ email, password });
  };

  // --- REPLICATE BACKEND PASSWORD POLICY FOR CLIENT-SIDE VALIDATION ---
  const validatePasswordPolicy = (password) => {
    const minLength = 12;
    const maxLength = 64;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength || password.length > maxLength) {
      return { valid: false, message: `Password must be between ${minLength} and ${maxLength} characters.` };
    }
    if (!hasUpperCase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowerCase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character.' };
    }
    return { valid: true, message: 'Password meets all requirements.' };
  };
  // --- END PASSWORD POLICY REPLICATION ---

  const handleSignup = (event) => {
    event.preventDefault();

    const fullName = event.target.fullName.value.trim();
    const email = event.target.email.value.trim();
    const address = event.target.address.value.trim();
    const phoneNumber = event.target.phoneNumber.value.trim();
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    let hasError = false;

    // --- Frontend Validations ---
    if (!fullName) {
      toast.error("Full Name is required!");
      hasError = true;
    }
    if (!email) {
      toast.error("Email is required!");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Basic email regex
      toast.error("Please enter a valid email format!");
      hasError = true;
    }
    if (!address) {
      toast.error("Address is required!");
      hasError = true;
    }
    if (!phoneNumber) {
      toast.error("Phone Number is required!");
      hasError = true;
    } else if (!/^\d{10}$/.test(phoneNumber)) { // Assumes 10-digit number for simplicity
      toast.error("Phone Number must be 10 digits!");
      hasError = true;
    }

    // Password policy validation using the replicated function
    if (!password) {
      toast.error("Password is required!");
      hasError = true;
    } else {
      const passwordValidationResult = validatePasswordPolicy(password);
      if (!passwordValidationResult.valid) {
        toast.error(passwordValidationResult.message);
        hasError = true;
      }
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      hasError = true;
    }

    if (hasError) {
      return; // Stop the form submission if any validation failed
    }
    // --- End Frontend Validations ---

    const role = 'customer';

    signupMutation.mutate({ full_name: fullName, email, address, phone_number: phoneNumber, password, role });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <div className="navbar bg-deepPurple shadow-md">
      <div className="flex-none">
        <a className="btn btn-ghost normal-case text-2xl font-bold text-white" href="/">
          Wheeloop
        </a>
      </div>

      <div className="flex-1 flex justify-center">
        <ul className="menu menu-horizontal px-2 space-x-6">
          <li>
            <a className="text-lg font-medium text-white hover:text-primary" href="/">
              Home
            </a>
          </li>
          <li>
            <a className="text-lg font-medium text-white hover:text-primary" href="/carlists">
              Cars
            </a>
          </li>
          <li>
            <a className="text-lg font-medium text-white hover:text-primary" href="/Booking">
              Booking
            </a>
          </li>
          <li>
            <a className="text-lg font-medium text-white hover:text-primary" href="/fetchpayment">
              Payment
            </a>
          </li>
          <li>
            <a className="text-lg font-medium text-white hover:text-primary" href="/notification">
              Notification
            </a>
          </li>
        </ul>
      </div>

      <div className="flex-none flex items-center space-x-4">
        {!loggedIn ? (
          <button
            onClick={toggleLoginModal}
            className="btn bg-primary hover:bg-primary/80 text-white px-5 py-2 text-lg font-semibold rounded-lg shadow-md transition duration-300"
          >
            Login
          </button>
        ) : (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:shadow-md">
              <div className="w-10 rounded-full">
                <img
                  alt="User Avatar"
                  src="src/assets/images/user_profile.png"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-lg z-[1] mt-3 w-52 p-3 shadow-lg">
              <li>
                <a className="justify-between cursor-pointer" onClick={() => navigate("/userprofile")}>
                  Profile
                  <span className="badge badge-primary">New</span>
                </a>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-[470px] relative">
            <button
              onClick={toggleLoginModal}
              className="absolute top-4 right-4 text-black-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-3xl text-black font-bold text-center mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4 flex justify-between items-center">
                <label className="flex items-center text-sm font-medium text-black">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a href="#" className="text-sm text-primary">Forgot password?</a>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg text-lg font-semibold transition duration-300"
              >
                Login
              </button>
            </form>
            <div className="text-center mt-4">
              <span className="text-sm text-black">Don't have an account?</span>
              <button
                onClick={toggleSignupModal}
                className="text-sm font-medium text-primary hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-[470px] relative">
            <button
              onClick={toggleSignupModal}
              className="absolute top-4 right-4 text-black-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-3xl text-black font-bold text-center mb-4">Sign Up</h2>
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg text-lg font-semibold transition duration-300"
              >
                Sign Up
              </button>
            </form>
            <div className="text-center mt-4">
              <span className="text-sm text-black">Already have an account?</span>
              <button
                onClick={toggleLoginModal}
                className="text-sm font-medium text-primary hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Navbar;