import { useState } from "react";
import Header from "@/components/Header";
import BookAppointmentDialog from "@/components/BookAppointmentDialog";
import { services } from "@/data/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Services() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(services.map(s => s.category)))];
  
  // Filter services based on selected category
  const filteredServices = selectedCategory === "All" 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  // Group services by category
  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 via-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Our Dental Services
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Comprehensive dental care with transparent pricing as per Indian Dental Association guidelines. 
              Charges may vary according to difficulty of treatment, materials, and expertise.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-12 flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Services by Category */}
          <div className="space-y-12">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-200">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                      <CardHeader>
                        <div className="flex gap-4 items-start mb-3">
                          <div className="flex-shrink-0">
                            {service.icon.startsWith("/") ? (
                              <img src={service.icon} alt={service.name} className="w-16 h-16 object-contain" />
                            ) : (
                              <div className="text-4xl">{service.icon}</div>
                            )}
                          </div>
                          <div className="flex-1 mt-2">
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription className="text-sm">{service.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Price Range</p>
                            <p className="text-lg font-bold text-blue-600">{service.price}</p>
                          </div>

                          {service.details && service.details.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">What's Included:</p>
                              <ul className="space-y-1">
                                {service.details.map((detail, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5 flex-shrink-0">✓</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => setBookingOpen(true)}
                          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          Book Now
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">📌 Note:</span> Charges may vary according to difficulty of treatment, materials used, and expertise required. 
              Prices are as per Indian Dental Association – Hadapsar Branch guidelines (effective 01/04/2023).
            </p>
          </div>
        </div>
      </section>

      <BookAppointmentDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
}
