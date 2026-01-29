import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, X } from "lucide-react";

interface ClinicSettings {
  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface BusinessHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

interface BusinessHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
}

interface WebsiteInfo {
  mainPhoneNumber: string;
  emergencyPhoneNumber: string;
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
  linkedinLink: string;
  websiteUrl: string;
  description: string;
  mainHeroImage: string;
}

interface AdminCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsContainer() {
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    clinicName: "Dental Clinic",
    clinicEmail: "clinic@dentalcare.com",
    clinicPhone: "+1 (555) 123-4567",
    address: "123 Medical Street",
    city: "New York",
    postalCode: "10001",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    weeklyReport: true,
  });

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Dr. John Smith",
      email: "john@dentalcare.com",
      phone: "+1 (555) 123-4567",
      position: "Lead Dentist",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@dentalcare.com",
      phone: "+1 (555) 123-4568",
      position: "Receptionist",
    },
  ]);

  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo>({
    mainPhoneNumber: "+1 (555) 123-4567",
    emergencyPhoneNumber: "+1 (555) 987-6543",
    facebookLink: "https://facebook.com/dentalclinic",
    instagramLink: "https://instagram.com/dentalclinic",
    twitterLink: "https://twitter.com/dentalclinic",
    linkedinLink: "https://linkedin.com/company/dentalclinic",
    websiteUrl: "https://www.dentalcare.com",
    description: "Leading dental care provider offering comprehensive treatment services",
    mainHeroImage: "dental.webp",
  });

  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleWebsiteInfoChange('mainHeroImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    handleWebsiteInfoChange('mainHeroImage', '');
  };

  const handleClinicSettingChange = (field: keyof ClinicSettings, value: string) => {
    setClinicSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleAddContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      position: "",
    };
    setContacts([...contacts, newContact]);
  };

  const handleUpdateContact = (id: string, field: keyof Contact, value: string) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleWebsiteInfoChange = (field: keyof WebsiteInfo, value: string) => {
    setWebsiteInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdminCredentialChange = (field: keyof AdminCredentials, value: string) => {
    setAdminCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdatePassword = () => {
    if (adminCredentials.newPassword !== adminCredentials.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (adminCredentials.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    // TODO: Send password change request to backend
    console.log("Password update requested for:", adminCredentials.currentPassword);
    setAdminCredentials({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    alert("Password updated successfully!");
  };

  const handleSaveSettings = () => {
    // TODO: Save settings to backend
    console.log("Settings saved:", { clinicSettings, notificationSettings });
  };

  return (
    <div className="space-y-4 ">
      <Accordion type="single" collapsible className="w-full">
        {/* Clinic Information Section */}
        <AccordionItem value="clinic" className="border border-gray-200 rounded-lg px-4 hover:bg-blue-50 transition-colors">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            <span className="text-gray-900">Clinic Information</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input
                      id="clinic-name"
                      value={clinicSettings.clinicName}
                      onChange={(e) => handleClinicSettingChange('clinicName', e.target.value)}
                      placeholder="Enter clinic name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-email">Email</Label>
                    <Input
                      id="clinic-email"
                      type="email"
                      value={clinicSettings.clinicEmail}
                      onChange={(e) => handleClinicSettingChange('clinicEmail', e.target.value)}
                      placeholder="Enter clinic email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-phone">Phone</Label>
                    <Input
                      id="clinic-phone"
                      value={clinicSettings.clinicPhone}
                      onChange={(e) => handleClinicSettingChange('clinicPhone', e.target.value)}
                      placeholder="Enter clinic phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-address">Address</Label>
                    <Input
                      id="clinic-address"
                      value={clinicSettings.address}
                      onChange={(e) => handleClinicSettingChange('address', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-city">City</Label>
                    <Input
                      id="clinic-city"
                      value={clinicSettings.city}
                      onChange={(e) => handleClinicSettingChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-postal">Postal Code</Label>
                    <Input
                      id="clinic-postal"
                      value={clinicSettings.postalCode}
                      onChange={(e) => handleClinicSettingChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Notifications Section */}
        <AccordionItem value="notifications" className="border border-gray-200 rounded-lg px-4 hover:bg-blue-50 transition-colors">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            <span className="text-gray-900">Notification Settings</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationToggle('emailNotifications')}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive SMS notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationToggle('smsNotifications')}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Appointment Reminders</p>
                      <p className="text-sm text-gray-600">Send appointment reminders</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.appointmentReminders}
                      onChange={() => handleNotificationToggle('appointmentReminders')}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-gray-600">Receive weekly clinic reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReport}
                      onChange={() => handleNotificationToggle('weeklyReport')}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Contacts Section */}
        <AccordionItem value="contacts" className="border border-gray-200 rounded-lg px-4 hover:bg-blue-50 transition-colors">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            <span className="text-gray-900">Contacts</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`contact-name-${contact.id}`}>Name</Label>
                          <Input
                            id={`contact-name-${contact.id}`}
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                            placeholder="Enter contact name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`contact-position-${contact.id}`}>Position</Label>
                          <Input
                            id={`contact-position-${contact.id}`}
                            value={contact.position}
                            onChange={(e) => handleUpdateContact(contact.id, 'position', e.target.value)}
                            placeholder="Enter position"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`contact-email-${contact.id}`}>Email</Label>
                          <Input
                            id={`contact-email-${contact.id}`}
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleUpdateContact(contact.id, 'email', e.target.value)}
                            placeholder="Enter email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`contact-phone-${contact.id}`}>Phone</Label>
                          <Input
                            id={`contact-phone-${contact.id}`}
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                            placeholder="Enter phone"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleDeleteContact(contact.id)} 
                        variant="destructive" 
                        className="w-full"
                      >
                        Remove Contact
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleAddContact} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Add New Contact
                </Button>
                <Button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Contacts
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Website Information Section */}
        <AccordionItem value="website" className="border border-gray-200 rounded-lg px-4 hover:bg-blue-50 transition-colors">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            <span className="text-gray-900">Website Information</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="main-phone">Main Phone Number</Label>
                    <Input
                      id="main-phone"
                      value={websiteInfo.mainPhoneNumber}
                      onChange={(e) => handleWebsiteInfoChange('mainPhoneNumber', e.target.value)}
                      placeholder="Enter main phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency-phone">Emergency Phone Number</Label>
                    <Input
                      id="emergency-phone"
                      value={websiteInfo.emergencyPhoneNumber}
                      onChange={(e) => handleWebsiteInfoChange('emergencyPhoneNumber', e.target.value)}
                      placeholder="Enter emergency phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website-url">Website URL</Label>
                    <Input
                      id="website-url"
                      value={websiteInfo.websiteUrl}
                      onChange={(e) => handleWebsiteInfoChange('websiteUrl', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook Link</Label>
                    <Input
                      id="facebook"
                      value={websiteInfo.facebookLink}
                      onChange={(e) => handleWebsiteInfoChange('facebookLink', e.target.value)}
                      placeholder="Enter Facebook URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram Link</Label>
                    <Input
                      id="instagram"
                      value={websiteInfo.instagramLink}
                      onChange={(e) => handleWebsiteInfoChange('instagramLink', e.target.value)}
                      placeholder="Enter Instagram URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter Link</Label>
                    <Input
                      id="twitter"
                      value={websiteInfo.twitterLink}
                      onChange={(e) => handleWebsiteInfoChange('twitterLink', e.target.value)}
                      placeholder="Enter Twitter URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Link</Label>
                    <Input
                      id="linkedin"
                      value={websiteInfo.linkedinLink}
                      onChange={(e) => handleWebsiteInfoChange('linkedinLink', e.target.value)}
                      placeholder="Enter LinkedIn URL"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Clinic Description</Label>
                  <textarea
                    id="description"
                    value={websiteInfo.description}
                    onChange={(e) => handleWebsiteInfoChange('description', e.target.value)}
                    placeholder="Enter clinic description for website"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="main-hero-image">Main Hero Image (Homepage)</Label>
                  <div className="flex gap-3">
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <input
                        id="main-hero-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  {websiteInfo.mainHeroImage && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Preview:</p>
                        <button
                          onClick={handleRemoveImage}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <img 
                        src={websiteInfo.mainHeroImage} 
                        alt="Hero Preview" 
                        className="max-w-full h-auto rounded max-h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveSettings} className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Website Information
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Admin Credentials Section */}
        <AccordionItem value="admin" className="border border-gray-200 rounded-lg px-4 hover:bg-blue-50 transition-colors">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            <span className="text-gray-900">Admin Credentials</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Security Notice:</strong> Update your password regularly to keep your account secure.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={adminCredentials.currentPassword}
                    onChange={(e) => handleAdminCredentialChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={adminCredentials.newPassword}
                    onChange={(e) => handleAdminCredentialChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={adminCredentials.confirmPassword}
                    onChange={(e) => handleAdminCredentialChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handleUpdatePassword} 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
