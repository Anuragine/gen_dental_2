import Header from "@/components/Header";

export default function Dentist() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet the Dentist</h1>
          <p className="text-gray-600 mb-8">
            This page is coming soon. Let us know what you'd like to see here!
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-md hover:bg-gray-800 transition">
            Continue building this page
          </button>
        </div>
      </div>
    </>
  );
}
