import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Lottie from "lottie-react";
import SearchForm from "./SearchFrom";
import cateringAnimation from "./animation/catering.json";
import partyAnimation from "./animation/party.json";
import weddingAnimation from "./animation/wedding.json";

const herobg = "https://img.freepik.com/premium-vector/gilded-harmony-intricate-line-mandala-with-gold-accents-blank-horizontal-vector-background-design_179530-1254.jpg?w=2000";

AOS.init();

const HeroSection = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${herobg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Floating Animations Container */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {/* Left Side - Wedding */}
        <div
          className="absolute left-4 md:left-12 lg:left-24 top-1/4 transform -translate-y-1/2"
          data-aos="fade-right"
          data-aos-duration="1200"
          data-aos-delay="400"
        >
          <div className="bg-white/15 backdrop-blur-md rounded-full p-4 md:p-6 shadow-2xl hover:bg-white/25 transition-all duration-500 hover:scale-110 animate-float">
            <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32">
              <Lottie animationData={weddingAnimation} loop={true} />
            </div>
          </div>
          <p className="text-white text-center mt-3 text-sm md:text-base font-semibold drop-shadow-lg">
            Weddings
          </p>
        </div>

        {/* Right Side Top - Party */}
        <div
          className="absolute right-4 md:right-12 lg:right-24 top-1/3 transform -translate-y-1/2"
          data-aos="fade-left"
          data-aos-duration="1200"
          data-aos-delay="600"
        >
          <div className="bg-white/15 backdrop-blur-md rounded-full p-4 md:p-6 shadow-2xl hover:bg-white/25 transition-all duration-500 hover:scale-110 animate-float-delayed">
            <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32">
              <Lottie animationData={partyAnimation} loop={true} />
            </div>
          </div>
          <p className="text-white text-center mt-3 text-sm md:text-base font-semibold drop-shadow-lg">
            Parties
          </p>
        </div>

        {/* Bottom Center - Catering */}
        <div
          className="absolute left-1/2 bottom-12 md:bottom-16 transform -translate-x-1/2"
          data-aos="fade-up"
          data-aos-duration="1200"
          data-aos-delay="800"
        >
          <div className="bg-white/15 backdrop-blur-md rounded-full p-4 md:p-6 shadow-2xl hover:bg-white/25 transition-all duration-500 hover:scale-110 animate-float">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
              <Lottie animationData={cateringAnimation} loop={true} />
            </div>
          </div>
          <p className="text-white text-center mt-3 text-sm md:text-base font-semibold drop-shadow-lg">
            Catering
          </p>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-xl"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          Find Everything for Your Event
        </h1>
        <p
          className="text-base md:text-xl lg:text-2xl mb-8 drop-shadow-lg"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          Discover vendors, book instantly, celebrate endlessly.
        </p>

        {/* Search Form */}
        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
          <SearchForm />
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
