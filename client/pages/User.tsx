import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import UserAppointments from "./components/UserAppointments";
import BookAppointmentForm from "@/components/BookAppointmentForm";
import FloatingChatbot from "@/components/FloatingChatbot";
import { useChatbot } from "@/context/ChatbotContext";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function User() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadPreviousChat } = useChatbot();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    // Check if tab is specified in URL
    const tab = searchParams.get("tab");
    return tab === "book" ? "book" : "appointments";
  });

  useEffect(() => {
    // Check if user is logged in and not admin
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !userData || isAdmin) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
      setIsAuthorized(true);
      // Load previous chat history for this user
      loadPreviousChat(parsedUser.email);
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
        <CardHeader className="border-b">
          <div className="flex justify-between items-center gap-6">
            <h1 className="text-3xl font-bold text-gray-900">Just-In Dental</h1>
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveSection("appointments")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "appointments" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                My Appointments
              </button>
              <button 
                onClick={() => setActiveSection("book")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "book" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                Book Appointment
              </button>
              <button 
                onClick={() => setActiveSection("profile")}
                className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                  activeSection === "profile" 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
                }`}
              >
                My Profile
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Appointments Section */}
          {activeSection === "appointments" && (
            <UserAppointments />
          )}

          {/* Profile Section */}
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>View and edit your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{user?.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Book Appointment Section */}
          {activeSection === "book" && (
            <BookAppointmentForm userName={user?.name} userEmail={user?.email} />
          )}
        </CardContent>
      </Card>
      <FloatingChatbot />
    </div>
  );
}
