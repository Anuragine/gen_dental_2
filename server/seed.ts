import mongoose from "mongoose";
import { User } from "./models/User";

async function seedDatabase() {
  try {
    const mongoUri = "mongodb://localhost:27017/Dental_Clinic";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create test users - don't hash here, let the schema handle it
    const testUsers = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: "password123",
      },
    ];

    const createdUsers = await User.create(testUsers);
    console.log(`✅ Seeded ${createdUsers.length} test users:`);
    createdUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    await mongoose.disconnect();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
