import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3001/api", // Backend API URL, adjust as needed
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
