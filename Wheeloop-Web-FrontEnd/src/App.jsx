import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import CarListing from "./components/Car/carCard";

import HomePage from "./components/HomePage/homePage";
import AdminPanel from "./components/admin/admin";
import Booking from "./components/booking/booking";
import Contact from "./components/contact/contact";
import NotificationPanel from "./components/notification/notification";
import FetchPayment from "./components/payment/fetchingPayment";
import Payment from "./components/payment/payment";
import EditProfileView from "./components/user_profile/edit_profile.";
import UserProfile from "./components/user_profile/user_profile";


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/carlists" element={<CarListing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/editprofile" element={<EditProfileView />} />
          <Route path="/fetchpayment" element={<FetchPayment />} />
          <Route path="/notification" element={<NotificationPanel />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
