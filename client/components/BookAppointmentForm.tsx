import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface BookAppointmentFormProps {
  userName?: string;
  userEmail?: string;
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

export default function BookAppointmentForm({
  userName,
  userEmail,
}: BookAppointmentFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    phoneNumber: "",
    date: "",
    time: "",
    service: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      service: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.date ||
      !formData.time ||
      !formData.service
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          date: formData.date,
          time: formData.time,
          service: formData.service,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description:
            "Your appointment has been booked successfully. You will receive a confirmation email soon.",
        });

        // Reset form
        setFormData({
          name: userName || "",
          email: userEmail || "",
          phoneNumber: "",
          date: "",
          time: "",
          service: "",
          notes: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to book appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while booking the appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={!!userName}
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Auto-filled from your profile
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={!!userEmail}
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Auto-filled from your profile
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
            <p className="text-xs text-gray-500">
              Or chat with our assistant to fill this field
            </p>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            <Select value={formData.service} onValueChange={handleServiceChange}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {SERVICES.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Ask our chatbot to help you choose
            </p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Preferred Date *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500">
              Available from tomorrow onwards
            </p>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time *</Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500">
              Clinic hours: 9:00 AM - 6:00 PM
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requests or health concerns..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Use the chatbot on the right to help fill
              this form! Just describe your appointment needs and the chatbot will
              guide you through the process.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
