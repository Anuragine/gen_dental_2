import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface APIAppointment {
  _id: string;
  date: string;
  time: string;
  service: string;
  dentistName?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  phoneNumber?: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  service: string;
  duration: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export default function AppointmentsContainer() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        console.log("Fetching appointments, token exists:", !!token);

        const response = await fetch("/api/appointments/admin/all", {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        console.log("Admin endpoint response status:", response.status);

        if (!response.ok) {
          console.log("Admin endpoint failed, trying user endpoint");
          // Fallback to user appointments if admin endpoint doesn't exist
          if (!token) {
            throw new Error("No authentication token found");
          }

          const userResponse = await fetch("/api/appointments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("User endpoint response status:", userResponse.status);
          
          if (!userResponse.ok) {
            const errorData = await userResponse.text();
            console.error("User endpoint error:", errorData);
            throw new Error("Failed to fetch appointments");
          }
          
          const data: APIAppointment[] = await userResponse.json();
          const transformed = data.map((apt) => ({
            id: apt._id,
            date: apt.date,
            time: apt.time,
            doctorName: apt.dentistName || "Unassigned",
            service: apt.service,
            duration: "30 minutes",
            patientName: apt.userName,
            patientEmail: apt.userEmail,
            patientPhone: apt.phoneNumber,
            notes: apt.notes,
            status: apt.status,
          }));
          setAppointments(transformed);
        } else {
          const data: APIAppointment[] = await response.json();
          console.log("Admin appointments fetched:", data.length);
          const transformed = data.map((apt) => ({
            id: apt._id,
            date: apt.date,
            time: apt.time,
            doctorName: apt.dentistName || "Unassigned",
            service: apt.service,
            duration: "30 minutes",
            patientName: apt.userName,
            patientEmail: apt.userEmail,
            patientPhone: apt.phoneNumber,
            notes: apt.notes,
            status: apt.status,
          }));
          setAppointments(transformed);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("Error fetching appointments:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonthDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonthDays = getDaysInMonth(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(prevMonthDays - i);
    }
    return days;
  };

  const getNextMonthDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const totalCells = 42;
    const filledCells = firstDay + daysInMonth;
    return totalCells - filledCells;
  };

  const handleQuickSelect = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`/api/appointments/${selectedAppointment.id}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ approvalMessage: "Your appointment has been confirmed." }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm appointment");
      }

      const updatedAppointment = await response.json();
      
      // Update appointments list
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: "confirmed" as const }
          : apt
      ));
      
      setSelectedAppointment(null);
      alert("Appointment confirmed successfully!");
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert(error instanceof Error ? error.message : "Failed to confirm appointment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment || !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      
      console.log("Rejecting appointment with reason:", rejectionReason);
      console.log("Appointment ID:", selectedAppointment.id);
      
      const response = await fetch(`/api/appointments/${selectedAppointment.id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ rejectionReason }),
      });

      console.log("Reject response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Reject error response:", errorData);
        throw new Error(errorData.message || `Failed to reject appointment (${response.status})`);
      }

      const updatedAppointment = await response.json();
      console.log("Updated appointment:", updatedAppointment);
      
      // Update appointments list
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: "cancelled" as const }
          : apt
      ));
      
      setSelectedAppointment(null);
      setRejectionReason("");
      alert("Appointment rejected successfully!");
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert(error instanceof Error ? error.message : "Failed to reject appointment");
    } finally {
      setIsProcessing(false);
    }
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const previousMonthDays = getPreviousMonthDays(currentDate);
  const nextMonthDays = getNextMonthDays(currentDate);

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const adjustedDayLabels =
    getFirstDayOfMonth(currentDate) === 0
      ? dayLabels
      : [
          ...dayLabels.slice(getFirstDayOfMonth(currentDate)),
          ...dayLabels.slice(0, getFirstDayOfMonth(currentDate)),
        ];

  // Filter appointments for selected date
  const appointmentsForSelectedDate = appointments.filter((apt) => {
    const aptDate = new Date(apt.date).toDateString();
    const selectedDateStr = selectedDate.toDateString();
    return aptDate === selectedDateStr;
  });

  // Count appointments per day for heatmap
  const getAppointmentCountForDay = (day: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getFullYear() === currentDate.getFullYear()
      );
    }).length;
  };

  // Get color shade based on appointment count
  const getHeatmapColor = (day: number) => {
    const count = getAppointmentCountForDay(day);
    if (count === 0) return "transparent";
    if (count === 1) return "#E0F2FE"; // light blue
    if (count === 2) return "#BAE6FD"; // lighter blue
    if (count === 3) return "#7DD3FC"; // light blue
    if (count === 4) return "#38BDF8"; // medium blue
    if (count === 5) return "#0EA5E9"; // medium-dark blue
    return "#0284C7"; // dark blue for 6+
  };

  return (
    <>
      <div className={selectedAppointment ? "blur-sm pointer-events-none" : ""}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>View all appointments</CardDescription>
          </CardHeader>
          <CardContent>
        <div className="flex gap-8">
          {/* Calendar - Left Side */}
          <div className="flex-shrink-0">
            <style>{`
              .datepicker {
                width: 100%;
                max-width: 350px;
                background-color: #FDFDFD;
                border-radius: 10px;
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2), 0 5px 10px 0 rgba(0, 0, 0, 0.1);
                padding: 1rem;
              }

              .datepicker-top {
                margin-bottom: 1rem;
              }

              .btn-group {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 1rem;
                margin-top: -0.5rem;
                gap: 0.5rem;
              }

              .tag {
                border: 0;
                background-color: #EAEBEC;
                border-radius: 10px;
                padding: 0.5em 0.75em;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.875rem;
                transition: background-color 0.2s;
              }

              .tag:hover {
                background-color: #D6DAE0;
              }

              .month-selector {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
              }

              .arrow {
                display: flex;
                align-items: center;
                justify-content: center;
                border: 0;
                background-color: #FFF;
                border-radius: 12px;
                width: 2.5rem;
                height: 2.5rem;
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.25), 0 0 10px 0 rgba(0, 0, 0, 0.15);
                cursor: pointer;
              }

              .month-name {
                font-weight: 600;
                flex: 1;
                text-align: center;
              }

              .datepicker-calendar {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                grid-row-gap: 1rem;
                gap: 0.5rem;
              }

              .day {
                color: #999FA6;
                font-size: 0.875em;
                font-weight: 500;
                justify-self: center;
              }

              .date {
                border: 0;
                padding: 0;
                width: 2.25rem;
                height: 2.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                font-weight: 600;
                border: 2px solid transparent;
                background-color: transparent;
                cursor: pointer;
              }

              .date.faded {
                color: #999FA6;
              }

              .date.current-day {
                color: #FFF;
                border-color: #008FFD;
                background-color: #008FFD;
              }

              .date.selected {
                color: #008FFD;
                border: 2px solid #CBE8FF;
                background-color: #CBE8FF;
              }

              .date:focus {
                outline: 0;
                color: #008FFD;
                border: 2px solid #CBE8FF;
              }
            `}</style>

            <div className="datepicker">
              <div className="datepicker-top">
                <div className="month-selector">
                  <button className="arrow" onClick={previousMonth}>
                    <ChevronLeft size={20} />
                  </button>
                  <span className="month-name">{monthName}</span>
                  <button className="arrow" onClick={nextMonth}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="datepicker-calendar">
                {dayLabels.map((day) => (
                  <span key={day} className="day">
                    {day}
                  </span>
                ))}

                {previousMonthDays.map((day) => (
                  <button
                    key={`prev-${day}`}
                    className="date faded"
                    onClick={() => {
                      previousMonth();
                    }}
                  >
                    {day}
                  </button>
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    className={`date ${isToday(day) ? "current-day" : ""} ${isSelected(day) ? "selected" : ""}`}
                    onClick={() => handleDateClick(day)}
                    style={{
                      backgroundColor: isSelected(day) ? "#CBE8FF" : getHeatmapColor(day),
                      borderColor: isToday(day) ? "#008FFD" : "transparent",
                    }}
                  >
                    {day}
                  </button>
                ))}

                {Array.from({ length: nextMonthDays }, (_, i) => i + 1).map((day) => (
                  <button
                    key={`next-${day}`}
                    className="date faded"
                    onClick={() => {
                      nextMonth();
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Details - Below Calendar */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Total Appointments:</span>
                  <span className="font-semibold text-gray-900">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Today's Appointments:</span>
                  <span className="font-semibold text-gray-900">
                    {appointments.filter((apt) => {
                      const aptDate = new Date(apt.date).toDateString();
                      const today = new Date().toDateString();
                      return aptDate === today;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Available Slots:</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-3">Appointment Density</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: "#E0F2FE" }}
                    ></div>
                    <span className="text-xs text-gray-600">1 appointment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: "#BAE6FD" }}
                    ></div>
                    <span className="text-xs text-gray-600">2 appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: "#7DD3FC" }}
                    ></div>
                    <span className="text-xs text-gray-600">3 appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: "#38BDF8" }}
                    ></div>
                    <span className="text-xs text-gray-600">4 appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: "#0EA5E9" }}
                    ></div>
                    <span className="text-xs text-gray-600">5 appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: "#0284C7" }}
                    ></div>
                    <span className="text-xs text-gray-600">6+ appointments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Details - Right Side */}
          <div className="flex-grow">
            <div className="space-y-6">
              {/* Selected Date Header */}
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">Selected Date</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Appointments Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Appointments
                </h3>
                
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-600">Loading appointments...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {!isLoading && !error && (
                  <div className="space-y-3">
                    {appointmentsForSelectedDate.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No appointments scheduled for this date</p>
                    ) : (
                      appointmentsForSelectedDate.map((apt) => {
                        const statusColors = {
                          pending: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", button: "bg-yellow-100/50 text-yellow-700 hover:bg-yellow-200/60" },
                          confirmed: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", button: "bg-green-100/50 text-green-700 hover:bg-green-200/60" },
                          completed: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", button: "bg-blue-100/50 text-blue-700 hover:bg-blue-200/60" },
                          cancelled: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", button: "bg-red-100/50 text-red-700 hover:bg-red-200/60" },
                        };
                        const colors = statusColors[apt.status] || statusColors.pending;
                        
                        return (
                          <div key={apt.id} className={`p-4 ${colors.bg} rounded-lg border ${colors.border} flex justify-between items-center`}>
                            <div>
                              <p className="text-sm font-medium text-gray-600">{apt.time}</p>
                              <p className="font-semibold text-gray-900">{apt.doctorName} - {apt.service}</p>
                              <p className="text-sm text-gray-600 mt-1">Patient: {apt.patientName || "N/A"}</p>
                              <p className={`text-xs font-semibold mt-2 ${colors.text}`}>
                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                              </p>
                            </div>
                            <button 
                              onClick={() => setSelectedAppointment(apt)}
                              className={`px-4 py-2 ${colors.button} text-sm transition-colors whitespace-nowrap ml-4 opacity-75 hover:opacity-100 rounded-md`}
                            >
                              View Details
                            </button>
                          </div>
                        );
                      })
                    )}
                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      + Add Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
      </div>

      {/* Modal Overlay */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Modal Container */}
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>

            {/* Modal Content */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
              </span>
            </div>

            {/* Appointment Info */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Time</p>
                <p className="font-semibold text-gray-900">{selectedAppointment.time}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Doctor</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.doctorName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Service</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.service}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">{selectedAppointment.duration}</p>
              </div>

              {/* Patient Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                
                <div className="space-y-3">
                  {selectedAppointment.patientName && (
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientName}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.patientEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientEmail}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.patientPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientPhone}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason Field - Only show for pending appointments */}
              {selectedAppointment.status === 'pending' && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if applicable)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    rows={3}
                    disabled={isProcessing}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              {selectedAppointment.status === 'pending' ? (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmAppointment}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={handleRejectAppointment}
                      disabled={isProcessing || !rejectionReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Deny'}
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
