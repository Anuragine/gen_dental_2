import { Link } from "react-router-dom";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import LoginDialog from "./LoginDialog";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shadow-sm backdrop-blur-sm relative overflow-hidden">
      {/* Abstract wavy stripe background */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 100"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="wavyPattern" x="0" y="0" width="400" height="100" patternUnits="userSpaceOnUse">
              {/* Thick horizontal organic wavy stripes with random width and unpredictable flow */}
              <path d="M-50,12 Q60,8 140,15 Q220,22 280,11 Q340,3 420,14 Q500,25 580,9" stroke="#000" strokeWidth="28" fill="none" strokeLinecap="round" />
              <path d="M-50,28 Q80,35 160,22 Q240,8 310,31 Q380,48 450,26 Q520,15 600,38" stroke="#000" strokeWidth="35" fill="none" strokeLinecap="round" />
              <path d="M-50,52 Q50,58 130,48 Q210,38 290,55 Q370,68 440,51 Q510,42 590,60" stroke="#000" strokeWidth="22" fill="none" strokeLinecap="round" />
              <path d="M-50,72 Q70,68 150,78 Q230,88 300,70 Q370,55 450,82 Q530,95 610,75" stroke="#000" strokeWidth="40" fill="none" strokeLinecap="round" />
              <path d="M-50,5 Q90,2 170,12 Q250,18 320,5 Q390,-2 470,8 Q550,18 630,2" stroke="#000" strokeWidth="18" fill="none" strokeLinecap="round" />
              <path d="M-50,42 Q65,48 145,38 Q225,28 295,45 Q365,58 435,40 Q505,32 585,52" stroke="#000" strokeWidth="30" fill="none" strokeLinecap="round" />
              <path d="M-50,88 Q55,95 135,85 Q215,75 285,92 Q355,105 425,88 Q495,78 575,98" stroke="#000" strokeWidth="26" fill="none" strokeLinecap="round" />
              <path d="M-50,20 Q100,15 180,25 Q260,35 330,18 Q400,8 480,28 Q560,42 640,22" stroke="#000" strokeWidth="32" fill="none" strokeLinecap="round" />
              <path d="M-50,62 Q85,72 165,58 Q245,45 315,68 Q385,82 455,65 Q525,55 605,78" stroke="#000" strokeWidth="24" fill="none" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wavyPattern)" />
        </svg>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/90" />
      
      <div className="container mx-auto relative z-10">
        <div className="flex justify-between items-center h-16 md:h-20 lg:h-18 px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-base md:text-lg lg:text-xl flex-shrink-0"
          >
            <span className="text-xl md:text-2xl"></span>
            <span className="text-gray-900 hidden xs:inline">
              Just IN Dental
            </span>
            <span className="text-gray-900 inline xs:hidden">Bright Smile</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Services
            </Link>
            {/*<Link
              to="/services"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Services
            </Link>
            <Link
              to="/dentist"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Field 3
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Field 4
            </Link>
            <Link
              to="/testimonials"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Field 5
            </Link>*/}
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary transition text-base"
            >
              Contact
            </Link>
          </nav>

          {/* Right side - Phone and CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:(558)122-6567"
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
            >
              <Phone className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm hidden xl:inline pr-2">+91 1234567890</span>
            </a>
            
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-md hover:bg-gray-800 transition font-medium text-base whitespace-nowrap"
            >
              Login
            </button>
          </div>

          {/* Tablet Navigation for md:lg */}
          <div className="hidden md:flex lg:hidden items-center gap-3">
            <a
              href="tel: 1234567890"
              className="flex items-center text-gray-700 hover:text-primary transition"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-gray-800 transition font-medium text-base"
            >
              Book
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-4 border-t">
            <Link
              to="/"
              className="block py-3 text-gray-700 text-base hover:text-primary transition"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="block py-3 text-gray-700 text-base hover:text-primary transition"
            >
              Services
            </Link>
            <Link
              to="/dentist"
              className="block py-3 text-gray-700 text-base hover:text-primary transition"
            >
              Meet the Dentist
            </Link>
            <Link
              to="/blog"
              className="block py-3 text-gray-700 text-base hover:text-primary transition"
            >
              Blog
            </Link>
            <Link
              to="/testimonials"
              className="block py-3 text-gray-700 text-base hover:text-primary transition"
            >
              Testimonials
            </Link>
            <Link
              to="/contact"
              className="block py-3 text-gray-700 text-base hover:text-primary transition"
            >
              Contact
            </Link>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full mt-4 bg-gray-900 text-white px-6 py-2.5 rounded-md hover:bg-gray-800 transition font-medium text-base"
            >
              Book Now
            </button>
          </nav>
        )}

        {/* Login Dialog */}
        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      </div>
    </header>
  );
}
