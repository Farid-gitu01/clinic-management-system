// This file contains helper functions to seed demo data
// Run this in browser console or API route if needed

import { database } from "./firebase"
import { ref, set } from "firebase/database"

export async function seedDemoData() {
  try {
    // Demo Doctors
    const doctors = [
      {
        id: "doc1",
        name: "Dr. Sarah Johnson",
        email: "sarah@clinic.com",
        phone: "+1 (555) 001-0001",
        specialization: "Cardiology",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "doc2",
        name: "Dr. Michael Chen",
        email: "michael@clinic.com",
        phone: "+1 (555) 001-0002",
        specialization: "Neurology",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "doc3",
        name: "Dr. Emily Rodriguez",
        email: "emily@clinic.com",
        phone: "+1 (555) 001-0003",
        specialization: "Pediatrics",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    // Demo Patients
    const patients = [
      {
        id: "pat1",
        name: "John Smith",
        email: "john@example.com",
        phone: "+1 (555) 002-0001",
        dateOfBirth: "1990-05-15",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "pat2",
        name: "Mary Johnson",
        email: "mary@example.com",
        phone: "+1 (555) 002-0002",
        dateOfBirth: "1985-08-22",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    // Demo Appointments
    const appointments = [
      {
        id: "apt1",
        patientName: "John Smith",
        doctorName: "Dr. Sarah Johnson",
        date: "2024-01-20",
        time: "10:00",
        reason: "Cardiac checkup",
        status: "scheduled",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "apt2",
        patientName: "Mary Johnson",
        doctorName: "Dr. Michael Chen",
        date: "2024-01-21",
        time: "14:30",
        reason: "Neurological assessment",
        status: "scheduled",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    // Demo Payments
    const payments = [
      {
        id: "pay1",
        patientName: "John Smith",
        amount: 150.0,
        date: "2024-01-15",
        status: "completed",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "pay2",
        patientName: "Mary Johnson",
        amount: 200.0,
        date: "2024-01-16",
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    // Write to database
    await Promise.all([
      set(ref(database, "doctors"), Object.fromEntries(doctors.map((d) => [d.id, d]))),
      set(ref(database, "patients"), Object.fromEntries(patients.map((p) => [p.id, p]))),
      set(ref(database, "appointments"), Object.fromEntries(appointments.map((a) => [a.id, a]))),
      set(ref(database, "payments"), Object.fromEntries(payments.map((p) => [p.id, p]))),
    ])

    console.log("Demo data seeded successfully!")
  } catch (error) {
    console.error("Error seeding demo data:", error)
  }
}
