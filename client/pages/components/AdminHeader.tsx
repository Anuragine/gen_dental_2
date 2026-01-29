import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  userName?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export default function AdminHeader({ 
  userName, 
  activeSection, 
  onSectionChange,
  onLogout 
}: AdminHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Just-In</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {userName}</span>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => onSectionChange("appointments")}
            className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
              activeSection === "appointments" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
            }`}
          >
            Appointments
          </button>
          <button 
            onClick={() => onSectionChange("users")}
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
            onClick={() => onSectionChange("resources")}
            className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
              activeSection === "resources" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
            }`}
          >
            Resources
          </button>
          */}

          <button 
            onClick={() => onSectionChange("settings")}
            className={`pb-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
              activeSection === "settings" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "border-b-2 border-transparent hover:border-b-2 hover:border-blue-600"
            }`}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
