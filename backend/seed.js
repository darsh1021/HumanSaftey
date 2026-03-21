require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Camera = require('./models/Camera');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Seed Users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Viewer User',
        email: 'viewer@test.com',
        password: 'password123',
        role: 'viewer'
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`User created: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // Seed Default Camera
    const cameraData = {
      name: 'Main Entrance Cam',
      location: 'Main Entrance',
      streamUrl: 'http://localhost:8000/video_feed',
      status: 'active'
    };

    const existingCamera = await Camera.findOne({ name: cameraData.name });
    if (!existingCamera) {
      await Camera.create(cameraData);
      console.log(`Camera created: ${cameraData.name}`);
    } else {
      console.log(`Camera already exists: ${cameraData.name}`);
    }

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
