import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { WorkerProfile } from '../models/WorkerProfile';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';

dotenv.config();

const SERVICES_DATA = [
  { name: 'Plumber', description: 'Pipe fitting, tap leak fix, drainage & bathroom fittings', icon: '🔧' },
  { name: 'Electrician', description: 'Short circuit fix, wiring, switchboards & fan installation', icon: '⚡' },
  { name: 'AC Repair', description: 'AC servicing, gas refilling, cooling issue & installation', icon: '❄️' },
  { name: 'Refrigerator Repair', description: 'Fridge cooling issues, compressor repair & gas leak', icon: '🧊' },
  { name: 'Washing Machine Repair', description: 'Drum repair, motor replacement & drainage fixes', icon: '🧺' },
  { name: 'Carpenter', description: 'Furniture repair, door lock installation & custom woodwork', icon: '🪚' },
  { name: 'Painter', description: 'Interior/exterior wall painting, touch-ups & waterproofing', icon: '🎨' },
  { name: 'Cleaning', description: 'Deep home cleaning, sofa cleaning & kitchen sanitation', icon: '🧹' },
  { name: 'Computer Repair', description: 'Laptop/PC formatting, OS install & hardware fixes', icon: '💻' },
  { name: 'Mobile Repair', description: 'Screen replacement, battery swap & charging port fix', icon: '📱' },
  { name: 'Mechanic', description: 'Two-wheeler & car repair, engine oil change & jumpstart', icon: '🚗' },
  { name: 'RO Repair', description: 'Water purifier filter replacement & membrane cleaning', icon: '🚰' },
  { name: 'CCTV Installation', description: 'Camera setup, DVR configuration & security wiring', icon: '📹' },
  { name: 'Appliance Repair', description: 'Microwave, mixer, induction & general electronics fix', icon: '🔌' },
];

const SEED_WORKERS = [
  {
    name: 'Arun Kumar',
    email: 'worker@fixit.demo',
    phone: '9876543211',
    bio: 'Certified AC technician with 8+ years experience in multi-brand split and window ACs.',
    serviceNames: ['AC Repair', 'Appliance Repair'],
    experienceYears: 8,
    startingPrice: 400,
    rating: 4.8,
    reviewCount: 34,
    completedJobs: 82,
    offsetLng: 0.005,
    offsetLat: 0.003,
  },
  {
    name: 'Karthik Raja',
    email: 'karthik@fixit.demo',
    phone: '9876543212',
    bio: 'Licensed electrician specializing in residential wiring, MCB installs & safety checks.',
    serviceNames: ['Electrician'],
    experienceYears: 7,
    startingPrice: 350,
    rating: 4.9,
    reviewCount: 45,
    completedJobs: 110,
    offsetLng: -0.012,
    offsetLat: 0.008,
  },
  {
    name: 'Ravi Shankar',
    email: 'ravi@fixit.demo',
    phone: '9876543213',
    bio: 'Expert plumber for emergency leaks, pipe replacement and sanitary fittings.',
    serviceNames: ['Plumber', 'RO Repair'],
    experienceYears: 5,
    startingPrice: 300,
    rating: 4.6,
    reviewCount: 28,
    completedJobs: 64,
    offsetLng: 0.015,
    offsetLat: -0.010,
  },
  {
    name: 'Suresh Babu',
    email: 'suresh@fixit.demo',
    phone: '9876543214',
    bio: 'Specialist in HVAC and heavy duty AC repair, gas charging and ductwork.',
    serviceNames: ['AC Repair', 'Refrigerator Repair'],
    experienceYears: 9,
    startingPrice: 450,
    rating: 4.9,
    reviewCount: 52,
    completedJobs: 135,
    offsetLng: -0.008,
    offsetLat: -0.015,
  },
  {
    name: 'Manoj Verma',
    email: 'manoj@fixit.demo',
    phone: '9876543215',
    bio: 'Woodwork master, door fitting, modular kitchen assembly & repair.',
    serviceNames: ['Carpenter'],
    experienceYears: 10,
    startingPrice: 500,
    rating: 4.7,
    reviewCount: 39,
    completedJobs: 95,
    offsetLng: 0.022,
    offsetLat: 0.018,
  },
  {
    name: 'Prakash Raj',
    email: 'prakash@fixit.demo',
    phone: '9876543216',
    bio: 'AC servicing, copper piping, leakage fix & inverter AC board repair.',
    serviceNames: ['AC Repair', 'Washing Machine Repair'],
    experienceYears: 6,
    startingPrice: 380,
    rating: 4.7,
    reviewCount: 22,
    completedJobs: 51,
    offsetLng: 0.001,
    offsetLat: -0.020,
  },
  {
    name: 'Deepak Varma',
    email: 'deepak@fixit.demo',
    phone: '9876543217',
    bio: 'Wall painting, damp proofing, texture designs & wood polishing.',
    serviceNames: ['Painter'],
    experienceYears: 6,
    startingPrice: 600,
    rating: 4.8,
    reviewCount: 19,
    completedJobs: 40,
    offsetLng: -0.025,
    offsetLat: 0.005,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@fixit.demo',
    phone: '9876543218',
    bio: 'Professional home deep cleaning, bathroom sanitization & carpet cleaning.',
    serviceNames: ['Cleaning'],
    experienceYears: 4,
    startingPrice: 499,
    rating: 4.5,
    reviewCount: 16,
    completedJobs: 33,
    offsetLng: 0.018,
    offsetLat: -0.005,
  },
  {
    name: 'Ganesh Ram',
    email: 'ganesh@fixit.demo',
    phone: '9876543219',
    bio: 'Laptop motherboard repair, screen replacement, SSD upgrade & virus removal.',
    serviceNames: ['Computer Repair', 'Mobile Repair'],
    experienceYears: 7,
    startingPrice: 350,
    rating: 4.8,
    reviewCount: 41,
    completedJobs: 88,
    offsetLng: -0.015,
    offsetLat: -0.012,
  },
  {
    name: 'Santhosh Kumar',
    email: 'santhosh@fixit.demo',
    phone: '9876543220',
    bio: 'RO water purifier filter change, UV lamp repair & TDS balancing.',
    serviceNames: ['RO Repair', 'Plumber'],
    experienceYears: 5,
    startingPrice: 280,
    rating: 4.7,
    reviewCount: 30,
    completedJobs: 72,
    offsetLng: 0.009,
    offsetLat: 0.025,
  },
  {
    name: 'Venkatesh N',
    email: 'venkatesh@fixit.demo',
    phone: '9876543221',
    bio: 'Commercial & residential CCTV camera installation, IP camera configuration.',
    serviceNames: ['CCTV Installation', 'Electrician'],
    experienceYears: 8,
    startingPrice: 750,
    rating: 4.9,
    reviewCount: 38,
    completedJobs: 60,
    offsetLng: -0.030,
    offsetLat: -0.002,
  },
  {
    name: 'Anand Kumar',
    email: 'anand@fixit.demo',
    phone: '9876543222',
    bio: '2-wheeler & 4-wheeler roadside assistance, brake check & oil service.',
    serviceNames: ['Mechanic'],
    experienceYears: 11,
    startingPrice: 400,
    rating: 4.8,
    reviewCount: 56,
    completedJobs: 140,
    offsetLng: 0.028,
    offsetLat: -0.018,
  },
  {
    name: 'Vijay Selvam',
    email: 'vijay@fixit.demo',
    phone: '9876543223',
    bio: 'All-round AC repair, compressor overhaul and duct cleaning specialist.',
    serviceNames: ['AC Repair', 'Electrician'],
    experienceYears: 7,
    startingPrice: 420,
    rating: 4.9,
    reviewCount: 33,
    completedJobs: 78,
    offsetLng: -0.003,
    offsetLat: 0.015,
  },
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('MONGODB_URI missing in .env');
      process.exit(1);
    }

    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding...');

    // Clear collections
    await User.deleteMany({});
    await Service.deleteMany({});
    await WorkerProfile.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing database data.');

    // Seed Services
    const createdServices = await Service.create(SERVICES_DATA);
    console.log(`Seeded ${createdServices.length} services.`);

    const serviceMap = new Map<string, mongoose.Types.ObjectId>();
    createdServices.forEach((s) => serviceMap.set(s.name, s._id));

    // Seed Demo Customer
    const demoCustomer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@fixit.demo',
      phone: '9876543210',
      password: 'Fixit@123',
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });
    console.log('Seeded demo customer (customer@fixit.demo / Fixit@123)');

    // Seed Workers & Profiles
    const baseLng = 77.3411; // Tiruppur longitude
    const baseLat = 11.1085; // Tiruppur latitude

    for (const wData of SEED_WORKERS) {
      const user = await User.create({
        name: wData.name,
        email: wData.email,
        phone: wData.phone,
        password: 'Fixit@123',
        role: 'worker',
        profileImage: `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80`,
      });

      const serviceIds = wData.serviceNames
        .map((name) => serviceMap.get(name))
        .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

      await WorkerProfile.create({
        user: user._id,
        bio: wData.bio,
        services: serviceIds,
        experienceYears: wData.experienceYears,
        startingPrice: wData.startingPrice,
        serviceRadius: 15,
        location: {
          type: 'Point',
          coordinates: [baseLng + wData.offsetLng, baseLat + wData.offsetLat],
        },
        address: 'Tiruppur, Tamil Nadu',
        isAvailable: true,
        isVerified: true,
        rating: wData.rating,
        reviewCount: wData.reviewCount,
        completedJobs: wData.completedJobs,
      });
    }

    console.log(`Seeded ${SEED_WORKERS.length} workers with profiles around Tiruppur.`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
