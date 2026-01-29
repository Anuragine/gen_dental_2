import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import Header from "@/components/Header";
import HeroFeaturedChatbot from "@/components/HeroFeaturedChatbot";

export default function Index() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  
  const fullText = "Get your perfect smile with our expert dental team.";
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  const handleBookAppointment = () => {
    const isLoggedIn = localStorage.getItem("token");
    if (!isLoggedIn) {
      // Show alert and don't proceed
      alert("Please login first to book an appointment");
      return;
    }
    // If logged in, redirect to user page with book tab selected
    navigate("/user?tab=book");
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 via-blue-50 to-white py-12 md:py-16 lg:py-24">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mb-12 md:mb-16 lg:mb-20">
            {/* Left Content */}
            <div>
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium mb-6">
                Welcome to Just In Dental
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Perfect Smile <br></br> Starts Here
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Experience premium dental care with our state-of-the-art
                facilities and compassionate team. We're committed to making
                every visit comfortable and stress-free.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4 mr-10">
                <button onClick={handleBookAppointment} className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-semibold flex items-center justify-center gap-2 text-base">
                  Book Appointment
                </button>
                <button className="border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-semibold text-base">
                  View Services
                </button>
              </div>
              
              {/* Typing Animation Container */}
              <div className="rounded-lg  inline-block pt-4">
                <p className="text-lg text-gray-800 font-medium h-7">
                  {displayedText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative z-10 aspect-video lg:aspect-auto">
                <img
                  src="dental.webp"
                  alt=""
                  className="rounded-2xl shadow-xl w-full h-full object-cover"
                />

                {/* Rating Card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 max-w-xs">
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-base">-/5.0</p>
                    <p className="text-sm text-gray-600">300+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot Card - Positioned at bottom of hero with hover expand effect */}
          <HeroFeaturedChatbot />
        </div>
      </section>

      {/* Content area below hero 
      <section className="bg-white py-20 md:py-28 lg:py-32">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              More Services Coming Soon
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We're continuously expanding our offerings to serve you better.
              Check back soon for more information about our comprehensive
              dental services.
            </p>
          </div>
        </div>
      </section>*/}
    </>
  );
}
