import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppointmentsContainer from "./components/AppointmentsContainer";
import SettingsContainer from "./components/SettingsContainer";
import UsersContainer from "./components/UsersContainer";
import FloatingChatbot from "@/components/FloatingChatbot";
import { useChatbot } from "@/context/ChatbotContext";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { loadPreviousChat } = useChatbot();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeSection, setActiveSection] = useState("appointments");

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const userData = localStorage.getItem("user");

    if (!isAdmin || !userData) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      if (parsedUser.email === "admin@gmail.com") {
        setUser(parsedUser);
        setIsAuthorized(true);
        // Load previous chat history for this admin user
        loadPreviousChat(parsedUser.email);
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  }, [navigate, loadPreviousChat]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50 to-white">
      <Card className="w-full rounded-none">
        <CardHeader className="border-b py-3 fixed top-0 left-0 right-0 bg-white z-50 shadow-md">
          <div className="flex justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Just-In Dental</h1>
              <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveSection("appointments")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "appointments" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                Appointments
              </button>
              <button 
                onClick={() => setActiveSection("users")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "users" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                Users
              </button>

              {/* 
              <button 
                onClick={() => setActiveSection("resources")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "resources" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                Resources
              </button>*/}

              
              <button 
                onClick={() => setActiveSection("settings")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "settings" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                Settings
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-center w-40 rounded-2xl h-12 relative text-black text-lg font-semibold group hover:shadow-lg transition-shadow"
                type="button"
              >
                <div className="bg-blue-400 rounded-xl h-10 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[152px] z-10 duration-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1024"
                    height="20px"
                    width="20px"
                  >
                    <path
                      d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                      fill="#000000"
                    ></path>
                    <path
                      d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                      fill="#000000"
                    ></path>
                  </svg>
                </div>
                <p className="translate-x-2">Logout</p>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-28">
        {/* Appointments Section */}
        {activeSection === "appointments" && (
          <div>
            <AppointmentsContainer />
          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <div>
            <UsersContainer />
          </div>
        )}

        {/* Resources Section */}
        {activeSection === "resources" && (
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Manage system resources</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Manage resources and inventory</p>
            </CardContent>
          </Card>
        )}

        {/* Settings Section */}
        {activeSection === "settings" && (
          <div>
            <SettingsContainer />
          </div>
        )}

        </CardContent>
      </Card>
      <FloatingChatbot />
    </div>
  );
}
