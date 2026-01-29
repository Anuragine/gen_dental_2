import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SERVICES = [
  "Anterior Tooth Fracture Repair",
  "BPS Denture",
  "Bridge Recementation",
  "Bruxzir Crown",
  "CAD CAM PFM Crown",
  "Cast Partial Denture",
  "Cast RPD Additional Tooth",
  "Ceramic Braces",
  "Ceramic Laminates",
  "Clear Aligners",
  "CLP / Perio Surgeries",
  "Co-Cr Metal Crown",
  "Composite Filling",
  "Composite Laminates",
  "Consultant Doctor",
  "Consultation",
  "Crown Recementation",
  "Dental Bleaching",
  "Dental Implant",
  "Denture Repair",
  "Depigmentation",
  "Diastema Closure",
  "Digital X-ray",
  "Disimpaction Surgery",
  "Fiber Glass Denture",
  "Firm Tooth Extraction",
  "Flap Surgery",
  "Flexible Denture",
  "Flexible RPD",
  "Fluoride Application",
  "Follow Up",
  "Fracture Mandible Treatment",
  "GIC Filling",
  "Gingivectomy",
  "Imported Lucitone Denture",
  "IOPA Film X-ray",
  "Lava/Procera/E-max Crown",
  "Lucitone Denture",
  "Metal Braces",
  "Minor Surgical Procedure",
  "Mobile Tooth Extraction",
  "Ni-Cr Metal Crown",
  "Night Guard / Mouth Guard",
  "Non-Surgical Perio Therapy",
  "Pediatric Restorations",
  "PFM Crown",
  "Post & Core",
  "Preformed Metal Crown",
  "Primary Tooth Extraction",
  "Pulpectomy",
  "RCT - Standard",
  "Removable Appliance",
  "Repeat RCT",
  "RPD Additional Tooth",
  "RPD Single Tooth",
  "Scaling & Polishing",
  "Silver Filling",
  "Space Maintainer",
  "Standard Acrylic Denture",
  "Strip Crown (Anterior)",
  "Surgical Extraction",
  "Temporary Crown",
  "Third Molar RCT",
  "Zirconia Crown",
  "Zirconia Crown (Pediatric)",
];

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

export default function BookAppointmentDialog({
  open,
  onOpenChange,
}: BookAppointmentDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [dentistName, setDentistName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !phoneNumber || !date || !time || !service) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Keep date in YYYY-MM-DD format (server will handle conversion)
      const appointmentData = {
        name,
        email,
        phoneNumber,
        date,
        time,
        service,
        dentistName: dentistName || undefined,
        notes: notes || undefined,
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }

      toast({
        title: "Success",
        description: "Your appointment has been booked successfully! We'll send you a confirmation email shortly.",
      });

      // Reset form
      setName("");
      setEmail("");
      setPhoneNumber("");
      setDate("");
      setTime("");
      setService("");
      setDentistName("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Appointment booking error:", error);
      const errorMessage =
        error instanceof Error
          ? error.name === "AbortError"
            ? "Request timeout - server not responding"
            : error.message
          : "Failed to book appointment";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  // Fill form with test data
  const fillTestData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setName("John Doe");
    setEmail("john@example.com");
    setPhoneNumber("9876543210");
    setDate(tomorrow.toISOString().split("T")[0]);
    setTime("10:00 AM");
    setService("Consultation");
    setDentistName("Dr. Smith");
    setNotes("Test appointment");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book an Appointment</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fillTestData}
              className="text-xs"
            >
              Fill Test Data
            </Button>
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule your dental appointment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(123) 456-7890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label htmlFor="service">
              Service <span className="text-red-500">*</span>
            </Label>
            <Select value={service} onValueChange={setService} disabled={isLoading}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((svc) => (
                  <SelectItem key={svc} value={svc}>
                    {svc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Appointment Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              disabled={isLoading}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">
              Time <span className="text-red-500">*</span>
            </Label>
            <Select value={time} onValueChange={setTime} disabled={isLoading}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dentist Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="dentist">Preferred Dentist (Optional)</Label>
            <Input
              id="dentist"
              type="text"
              placeholder="Dr. Smith"
              value={dentistName}
              onChange={(e) => setDentistName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or health conditions we should know about?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              className="resize-none h-20"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Booking..." : "Book Appointment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
