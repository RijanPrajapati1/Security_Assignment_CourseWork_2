import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axios"; // Assuming axiosInstance is configured for your backend API base URL

// FIX: Make sure your baseURL in src/utils/axios.js is just 'http://localhost:3001'
// and NOT 'http://localhost:3001/api' if your routes start with /api/cred/...

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

const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // --- NEW/MODIFIED MFA/OTP STATE ---
  const [mfaRequired, setMfaRequired] = useState(false); // For login flow
  const [registrationOtpRequired, setRegistrationOtpRequired] = useState(false); // For signup flow
  const [currentOtpUserId, setCurrentOtpUserId] = useState(null); // userId (cred._id) for current OTP verification (either reg or login)
  const [currentOtpEmail, setCurrentOtpEmail] = useState(''); // Email for current OTP display

  // States to hold registration data until OTP is verified
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null);
  // --- END NEW/MODIFIED MFA/OTP STATE ---

  // --- NEW: Password Strength Assessment States ---
  const [signupPassword, setSignupPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState({ message: '', type: '', score: 0 }); // type: 'error', 'warning', 'success'
  const [confirmPassword, setConfirmPassword] = useState('');
  // --- END NEW: Password Strength Assessment States ---

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setLoggedIn(true);
      const userRole = localStorage.getItem("userRole");
      if (userRole === "admin" && window.location.pathname !== "/admin") {
        navigate("/admin");
      } else if (userRole === "customer" && window.location.pathname === "/admin") {
        navigate("/");
      }
    }
  }, [navigate]);

  const toggleLoginModal = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
    setIsSignupModalOpen(false);
    setMfaRequired(false); // Reset login MFA state
    setCurrentOtpUserId(null);
    setCurrentOtpEmail('');
  };

  const toggleSignupModal = () => {
    setIsSignupModalOpen(!isSignupModalOpen);
    setIsLoginModalOpen(false);
    setRegistrationOtpRequired(false); // Reset registration OTP state
    setCurrentOtpUserId(null);
    setCurrentOtpEmail('');
    setPendingRegistrationData(null); // Clear pending data
    setSignupPassword(''); // Clear password fields on modal toggle
    setConfirmPassword('');
    setPasswordFeedback({ message: '', type: '', score: 0 }); // Clear feedback
  };

  // --- Helper for real-time password strength feedback ---
  const getPasswordStrengthFeedback = (password) => {
    const minLength = 12;
    const maxLength = 64;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let score = 0;
    let messages = [];

    // Length check
    if (password.length >= minLength) {
      score++;
    } else {
      messages.push(`Minimum ${minLength} characters.`);
    }
    if (password.length <= maxLength) { // Only count if within max, or warn otherwise.
      // score++; // Don't add score for max length, just ensure it's not over.
    } else {
      messages.push(`Maximum ${maxLength} characters.`);
    }

    if (hasUpperCase) score++; else messages.push('Uppercase letter.');
    if (hasLowerCase) score++; else messages.push('Lowercase letter.');
    if (hasNumber) score++; else messages.push('Number.');
    if (hasSpecialChar) score++; else messages.push('Special character.');

    let type = 'error'; // default
    let overallMessage = '';

    if (password.length === 0) {
      return { message: '', type: '', score: 0 }; // No feedback if empty
    }

    const requirementsMet = [
      password.length >= minLength && password.length <= maxLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    ].filter(Boolean).length;


    if (requirementsMet === 5) {
      type = 'success';
      overallMessage = 'Excellent password!';
    } else if (requirementsMet >= 3) {
      type = 'warning';
      overallMessage = 'Good password. Missing: ' + messages.filter(Boolean).join(', ');
    } else {
      type = 'error';
      overallMessage = 'Weak password. Missing: ' + messages.filter(Boolean).join(', ');
    }
    // If messages array is empty for 'weak' or 'good' (shouldn't happen if requirementsMet < 5)
    if (requirementsMet < 5 && messages.length === 0) {
      overallMessage = "Password does not meet all requirements.";
    }


    return { message: overallMessage, type: type, score: requirementsMet };
  };

  const handleSignupPasswordChange = (e) => {
    const newPassword = e.target.value;
    setSignupPassword(newPassword);
    const feedback = getPasswordStrengthFeedback(newPassword);
    setPasswordFeedback(feedback);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // --- Handle Login Mutation (Modified for MFA) ---
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post("/cred/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // NOTE: Based on previous discussion "MFA once ever", the backend `login`
      // controller should now *never* return 'MFA required'. It will always
      // proceed directly to login if `mfaEnabled` is true in the DB.
      // This `if (data.message === 'MFA required...')` block is now largely
      // redundant unless you change the backend logic for login MFA.
      // Keeping it for robustness in case backend logic evolves.
      if (data.message === 'MFA required. Please verify with OTP.') {
        setMfaRequired(true); // Flag for login MFA
        setCurrentOtpUserId(data.userId); // Store userId for OTP verification
        setCurrentOtpEmail(data.email); // Store email for display
        toast.info(`MFA required. An OTP has been sent to your registered email: ${data.email}.`);
      } else {
        console.log("Login Success (No MFA):", data);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.full_name);
        setLoggedIn(true);
        setIsLoginModalOpen(false);
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        toast.success('Login successful!');
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

  // --- NEW: Verify Login MFA OTP Mutation ---
  const verifyMfaOtpMutation = useMutation({
    mutationFn: async ({ userId, otp }) => {
      const response = await axiosInstance.post("/cred/verify-mfa-otp", { userId, otp });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Verify Login OTP Success:", data);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("fullName", data.full_name);
      setLoggedIn(true);
      setIsLoginModalOpen(false);
      setMfaRequired(false); // Reset MFA state
      setCurrentOtpUserId(null);
      setCurrentOtpEmail('');

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      toast.success('MFA successful, login complete!');
    },
    onError: (error) => {
      console.log("Verify Login OTP Error:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("OTP verification failed. Please try again.");
      }
    }
  });

  // --- NEW: Resend Login MFA OTP Mutation ---
  const resendMfaOtpMutation = useMutation({
    mutationFn: async ({ userId }) => {
      const response = await axiosInstance.post("/cred/resend-mfa-otp", { userId });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Resend Login OTP Success:", data);
      toast.success(data); // "New MFA OTP sent to your registered email."
    },
    onError: (error) => {
      console.log("Resend Login OTP Error:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    }
  });

  // --- Handle Signup (Register) Mutation ---
  const signupMutation = useMutation({
    mutationFn: (userData) => {
      console.log("Sending signup request", userData);
      return axiosInstance.post("/cred/register", userData);
    },
    onMutate: () => {
      toast.info("Processing your signup...", {
        toastId: "signupProcessing",
        autoClose: false
      });
    },
    onSuccess: (response) => {
      toast.dismiss("signupProcessing");
      console.log("Signup request successful (pending OTP verification):", response.data);
      toast.success(response.data.message || "Registration initiated! Please verify with OTP sent to your email.");

      setRegistrationOtpRequired(true); // Flag to show OTP input for registration
      setCurrentOtpUserId(response.data.userId); // Store temporary userId
      setCurrentOtpEmail(response.data.email); // Store email for display
      setPendingRegistrationData(response.data); // Store any other data needed for next step
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

  // --- NEW: Verify Registration OTP Mutation ---
  const verifyRegistrationOtpMutation = useMutation({
    mutationFn: async ({ userId, otp }) => {
      const response = await axiosInstance.post("/cred/verify-registration-otp", { userId, otp });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Verify Registration OTP Success:", data);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("fullName", data.full_name);
      setLoggedIn(true);
      setIsSignupModalOpen(false); // Close signup modal
      setRegistrationOtpRequired(false); // Reset registration OTP state
      setCurrentOtpUserId(null);
      setCurrentOtpEmail('');
      setPendingRegistrationData(null);
      setSignupPassword(''); // Clear password fields
      setConfirmPassword('');
      setPasswordFeedback({ message: '', type: '', score: 0 }); // Clear feedback

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      toast.success('Registration and MFA successful! You are now logged in.');
    },
    onError: (error) => {
      console.log("Verify Registration OTP Error:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data);
        if (error.response.data === 'Invalid or expired OTP. Please re-register.') {
          // Force user to restart registration process
          setRegistrationOtpRequired(false);
          setCurrentOtpUserId(null);
          setCurrentOtpEmail('');
          setPendingRegistrationData(null);
          // Open signup modal again to allow re-registration
          setIsSignupModalOpen(true);
        }
      } else {
        toast.error("OTP verification failed. Please try again.");
      }
    }
  });

  const handleLogin = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    loginMutation.mutate({ email, password });
  };

  // Handle OTP submission, now checking if it's for registration or login
  const handleOtpSubmit = (event) => {
    event.preventDefault();
    const otp = event.target.otp.value;
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }
    if (!currentOtpUserId) {
      toast.error("Missing user ID for OTP verification. Please try again.");
      return;
    }

    if (registrationOtpRequired) {
      // It's for initial registration OTP
      verifyRegistrationOtpMutation.mutate({ userId: currentOtpUserId, otp });
    } else if (mfaRequired) {
      // It's for subsequent login MFA
      verifyMfaOtpMutation.mutate({ userId: currentOtpUserId, otp });
    } else {
      toast.error("Unknown OTP verification state. Please try logging in/registering again.");
      toggleLoginModal(); // Close modal to reset
    }
  };

  const handleResendOtp = () => {
    if (!currentOtpUserId) {
      toast.error("Cannot resend OTP. Please try again.");
      return;
    }
    if (registrationOtpRequired) {
      // For registration, if OTP expired or user needs new, they need to re-register.
      // This is because the backend deletes the temp user on OTP expiry/mismatch.
      toast.info("For registration, if OTP expired, please re-register to get a new one.");
      // Automatically close the OTP modal and re-open signup form
      setRegistrationOtpRequired(false);
      setCurrentOtpUserId(null);
      setCurrentOtpEmail('');
      setPendingRegistrationData(null);
      setIsSignupModalOpen(true); // Re-open signup modal
    } else if (mfaRequired) {
      // For login MFA (if your backend allowed it, though current backend doesn't trigger login MFA anymore)
      resendMfaOtpMutation.mutate({ userId: currentOtpUserId });
    }
  };

  const handleSignup = (event) => {
    event.preventDefault();

    const fullName = event.target.fullName.value.trim();
    const email = event.target.email.value.trim();
    const address = event.target.address.value.trim();
    const phoneNumber = event.target.phoneNumber.value.trim();
    // const password = event.target.password.value; // Get from state now
    // const confirmPassword = event.target.confirmPassword.value; // Get from state now

    let hasError = false;

    if (!fullName) { toast.error("Full Name is required!"); hasError = true; }
    if (!email) { toast.error("Email is required!"); hasError = true; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email format!"); hasError = true; }
    if (!address) { toast.error("Address is required!"); hasError = true; }
    if (!phoneNumber) { toast.error("Phone Number is required!"); hasError = true; }
    else if (!/^\d{10}$/.test(phoneNumber)) { toast.error("Phone Number must be 10 digits!"); hasError = true; }

    if (!signupPassword) {
      toast.error("Password is required!"); hasError = true;
    } else {
      const passwordValidationResult = validatePasswordPolicy(signupPassword);
      if (!passwordValidationResult.valid) {
        toast.error(passwordValidationResult.message); hasError = true;
      }
    }
    if (signupPassword !== confirmPassword) { toast.error("Passwords do not match!"); hasError = true; }

    if (hasError) { return; }

    const role = 'customer';
    signupMutation.mutate({ full_name: fullName, email, address, phone_number: phoneNumber, password: signupPassword, role });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    setLoggedIn(false);
    navigate("/");
  };

  // Helper to determine the width of the strength bar
  const getStrengthBarWidth = (score) => {
    // Max score is 5 (length, uppercase, lowercase, number, special char)
    return (score / 5) * 100;
  };

  // Helper to determine the color of the strength bar and text
  const getStrengthClass = (type) => {
    switch (type) {
      case 'error': return 'bg-red-500 text-red-700';
      case 'warning': return 'bg-orange-500 text-orange-700';
      case 'success': return 'bg-green-500 text-green-700';
      default: return ''; // No class for empty/initial state
    }
  };


  return (
    <div className="navbar bg-deepPurple shadow-md">
      <ToastContainer /> {/* Ensure ToastContainer is rendered */}
      <div className="flex-none">
        <a className="btn btn-ghost normal-case text-2xl font-bold text-white" href="/">
          Wheeloop
        </a>
      </div>

      <div className="flex-1 flex justify-center">
        <ul className="menu menu-horizontal px-2 space-x-6">
          <li><a className="text-lg font-medium text-white hover:text-primary" href="/">Home</a></li>
          <li><a className="text-lg font-medium text-white hover:text-primary" href="/carlists">Cars</a></li>
          <li><a className="text-lg font-medium text-white hover:text-primary" href="/Booking">Booking</a></li>
          <li><a className="text-lg font-medium text-white hover:text-primary" href="/fetchpayment">Payment</a></li>
          <li><a className="text-lg font-medium text-white hover:text-primary" href="/notification">Notification</a></li>
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
            <h2 className="text-3xl text-black font-bold text-center mb-4">
              {mfaRequired ? 'Verify Multi-Factor Authentication' : 'Login'}
            </h2>
            {mfaRequired ? (
              // MFA OTP Input Form for LOGIN
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4 text-center text-black">
                  <p>An OTP has been sent to your registered email: <strong>{currentOtpEmail}</strong></p>
                  <p>Please enter the code to complete your login.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">One-Time Password (OTP)</label>
                  <input
                    type="text"
                    name="otp"
                    maxLength="6"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg"
                    placeholder="******"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg text-lg font-semibold transition duration-300"
                  disabled={verifyMfaOtpMutation.isPending}
                >
                  {verifyMfaOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm font-medium text-primary hover:underline"
                    disabled={resendMfaOtpMutation.isPending}
                  >
                    {resendMfaOtpMutation.isPending ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            ) : (
              // Normal Login Form
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
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
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Logging In...' : 'Login'}
                </button>
              </form>
            )}

            {/* Common part for Login/MFA modal - switch to signup */}
            {!mfaRequired && (
              <div className="text-center mt-4">
                <span className="text-sm text-black">Don't have an account?</span>
                <button
                  onClick={toggleSignupModal}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signup Modal (Modified for Registration OTP) */}
      {isSignupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-[470px] relative">
            <button
              onClick={toggleSignupModal}
              className="absolute top-4 right-4 text-black-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-3xl text-black font-bold text-center mb-4">
              {registrationOtpRequired ? 'Verify Your Email' : 'Sign Up'}
            </h2>

            {registrationOtpRequired ? (
              // OTP input for Registration Verification
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4 text-center text-black">
                  <p>An OTP has been sent to <strong>{currentOtpEmail}</strong> to verify your registration.</p>
                  <p>Please enter the code to complete your signup.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">One-Time Password (OTP)</label>
                  <input
                    type="text"
                    name="otp"
                    maxLength="6"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg"
                    placeholder="******"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg text-lg font-semibold transition duration-300"
                  disabled={verifyRegistrationOtpMutation.isPending}
                >
                  {verifyRegistrationOtpMutation.isPending ? 'Verifying...' : 'Verify Email & Complete Signup'}
                </button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Resend OTP / Re-register
                  </button>
                </div>
              </form>
            ) : (
              // Normal Signup Form (with password strength feedback)
              <form onSubmit={handleSignup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={signupPassword} // Controlled component
                    onChange={handleSignupPasswordChange} // Handle real-time feedback
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  {/* Password Strength Feedback */}
                  {signupPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className={`h-2.5 rounded-full ${getStrengthClass(passwordFeedback.type)} transition-all duration-300`}
                          style={{ width: `${getStrengthBarWidth(passwordFeedback.score)}%` }}
                        ></div>
                      </div>
                      <p className={`text-sm ${getStrengthClass(passwordFeedback.type)}`}>
                        {passwordFeedback.message}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword} // Controlled component
                    onChange={handleConfirmPasswordChange}
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg text-lg font-semibold transition duration-300"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? 'Signing Up...' : 'Sign Up'}
                </button>
              </form>
            )}
            {/* Common part for Signup modal - switch to login */}
            {!registrationOtpRequired && (
              <div className="text-center mt-4">
                <span className="text-sm text-black">Already have an account?</span>
                <button
                  onClick={toggleLoginModal}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;