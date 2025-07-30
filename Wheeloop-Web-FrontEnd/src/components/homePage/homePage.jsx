import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { FaCarSide, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import Navbar from "../navBar/navbar";


const HomePage = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    return (
        <div>
            <Navbar />
            <section id="home" className="w-full min-h-screen bg-white flex items-center justify-center">
                <div className="w-full px-6 sm:px-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Text Section */}
                    <div className="space-y-6 w-full lg:w-1/2" data-aos="fade-right">
                        <p className="text-purple-700 text-3xl font-serif">Effortless</p>
                        <h1 className="text-6xl lg:text-7xl  text-black font-bold font-serif">WHEELOOP</h1>
                        <h2 className="text-3xl lg:text-4xl font-semibold text-black">Rent. Ride. Repeat.</h2>
                        <p className="text-lg lg:text-xl text-black">
                            Discover seamless car rentals with Wheeloop. Whether you need a ride for daily commutes, weekend getaways,
                            or business trips, we have the perfect vehicle for you. Explore our fleet and enjoy a hassle-free experience.
                        </p>
                        <button
                            onClick={() => window.location.href = "/carlists"}
                            className="rounded-md bg-purple-600 hover:bg-purple-700 transition duration-500 py-3 px-8 text-white text-xl"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Image Section */}
                    <div
                        className="flex justify-center items-center w-full lg:w-1/2"
                        data-aos="zoom-in"
                        data-aos-duration="1500"
                    >
                        <img
                            src="src/assets/images/banner-car.png"
                            alt="Car Banner"
                            className="w-[90%] lg:w-[95%] max-h-[700px] object-contain drop-shadow-[2px_20px_6px_rgba(0,0,0,0.50)]"
                        />
                    </div>
                </div>
            </section>


            {/* Recommendation Section */}
            <section id="recommendation" className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-full max-w-6xl px-6 space-y-6" data-aos="fade-up">
                    <h2 className="text-5xl font-bold text-center text-purple-700">Our Services</h2>
                    <p className="text-lg text-center text-gray-700 leading-relaxed">
                        Based on your travel needs, here are the best car options to suit your journey.
                        Whether you're driving solo, with family, or want a luxurious experience, we've got
                        the perfect ride for you.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                            <FaCarSide className="text-purple-600 text-5xl mb-3" />
                            <h3 className="text-2xl font-semibold text-gray-900">Compact Car</h3>
                            <p className="text-gray-700 leading-relaxed mt-2">
                                Ideal for city driving, easy to park, and fuel-efficient. Perfect for quick
                                commutes and business trips.
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                            <FaCarSide className="text-purple-600 text-5xl mb-3" />
                            <h3 className="text-2xl font-semibold text-gray-900">SUV</h3>
                            <p className="text-gray-700 leading-relaxed mt-2">
                                Spacious, comfortable, and perfect for long road trips. Excellent for
                                families and adventure lovers.
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                            <FaCarSide className="text-purple-600 text-5xl mb-3" />
                            <h3 className="text-2xl font-semibold text-gray-900">Luxury</h3>
                            <p className="text-gray-700 leading-relaxed mt-2">
                                Experience ultimate comfort and elegance with our premium car rentals,
                                designed for special occasions and VIP travel.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="w-full min-h-screen bg-gray-200 flex items-center justify-center">
                <div className="w-full max-w-5xl px-6 text-center space-y-6" data-aos="fade-up">
                    <h2 className="text-5xl font-semibold text-purple-700">About Wheeloop</h2>
                    <p className="text-xl lg:text-2xl text-gray-800 leading-relaxed">
                        Welcome to <strong>Wheeloop</strong> – your ultimate car rental service designed to make every journey smooth,
                        comfortable, and affordable. Whether you're planning a **business trip**, a **weekend getaway**, or need
                        a **daily commute solution**, Wheeloop offers a diverse fleet of high-quality vehicles tailored to your needs.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        At Wheeloop, we believe that renting a car should be **simple, hassle-free, and accessible to everyone**.
                        Our platform provides **instant online booking**, **transparent pricing**, and **exceptional customer support**,
                        ensuring a stress-free experience from start to finish.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        We offer a range of **vehicles**, from **compact city cars** to **luxurious SUVs**, catering to different
                        travel needs. Whether you need a **fuel-efficient car** for daily use or a **comfortable SUV** for a family road trip,
                        Wheeloop has got you covered.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Our commitment to **quality service, affordability, and customer satisfaction** sets us apart. With **24/7
                        roadside assistance**, **flexible rental options**, and a **dedicated support team**, Wheeloop ensures that
                        you can **rent, ride, and repeat** with confidence.
                    </p>

                </div>
            </section>


            {/* Contact Section */}
            <section id="contact" className="w-full min-h-screen bg-gray-200 flex items-center justify-center">
                <div className="w-full max-w-3xl px-6 space-y-8 text-center" data-aos="fade-up">
                    <h2 className="text-5xl font-bold text-purple-700">Contact Us</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Have questions or need assistance? Get in touch with us!
                    </p>
                    <div className="flex flex-col sm:flex-row justify-around text-left">
                        {/* Email */}
                        <div className="flex items-center gap-4 mb-6 sm:mb-0">
                            <FaEnvelope className="text-purple-600 text-4xl" />
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900">Email</h4>
                                <p className="text-gray-700">support@wheeloop.com</p>
                            </div>
                        </div>
                        {/* Phone */}
                        <div className="flex items-center gap-4 mb-6 sm:mb-0">
                            <FaPhone className="text-purple-600 text-4xl" />
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900">Phone</h4>
                                <p className="text-gray-700">9812345678</p>
                            </div>
                        </div>
                        {/* Location */}
                        <div className="flex items-center gap-4">
                            <FaMapMarkerAlt className="text-purple-600 text-4xl" />
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900">Location</h4>
                                <p className="text-gray-700">Bhaktapur, Kathmandu, Nepal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
