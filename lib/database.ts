import { database } from "./firebase"
import { ref, set, get, update, remove } from "firebase/database"
import type { UserProfile } from "./auth-context"

// Users
export async function createUser(userId: string, userData: Omit<UserProfile, "uid">) {
  const userRef = ref(database, `users/${userId}`)
  return set(userRef, {
    uid: userId,
    ...userData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

export async function getUserProfile(userId: string) {
  const userRef = ref(database, `users/${userId}`)
  const snapshot = await get(userRef)
  return snapshot.val()
}

export async function updateUser(userId: string, updates: Partial<UserProfile>) {
  const userRef = ref(database, `users/${userId}`)
  return update(userRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}

// Doctors
export async function addDoctor(doctorData: any) {
  const doctorRef = ref(database, `doctors/${doctorData.id}`)
  return set(doctorRef, {
    ...doctorData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "active",
  })
}

export async function getDoctors() {
  const doctorsRef = ref(database, "doctors")
  const snapshot = await get(doctorsRef)
  return snapshot.val() || {}
}

export async function updateDoctor(doctorId: string, updates: any) {
  const doctorRef = ref(database, `doctors/${doctorId}`)
  return update(doctorRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}

export async function deleteDoctor(doctorId: string) {
  const doctorRef = ref(database, `doctors/${doctorId}`)
  return remove(doctorRef)
}

// Patients
export async function addPatient(patientData: any) {
  const patientRef = ref(database, `patients/${patientData.id}`)
  return set(patientRef, {
    ...patientData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "active",
  })
}

export async function getPatients() {
  const patientsRef = ref(database, "patients")
  const snapshot = await get(patientsRef)
  return snapshot.val() || {}
}

export async function updatePatient(patientId: string, updates: any) {
  const patientRef = ref(database, `patients/${patientId}`)
  return update(patientRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}

export async function deletePatient(patientId: string) {
  const patientRef = ref(database, `patients/${patientId}`)
  return remove(patientRef)
}

// Appointments
export async function addAppointment(appointmentData: any) {
  const appointmentRef = ref(database, `appointments/${appointmentData.id}`)
  return set(appointmentRef, {
    ...appointmentData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "scheduled",
  })
}

export async function getAppointments() {
  const appointmentsRef = ref(database, "appointments")
  const snapshot = await get(appointmentsRef)
  return snapshot.val() || {}
}

export async function updateAppointment(appointmentId: string, updates: any) {
  const appointmentRef = ref(database, `appointments/${appointmentId}`)
  return update(appointmentRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}

// Payments
export async function addPayment(paymentData: any) {
  const paymentRef = ref(database, `payments/${paymentData.id}`)
  return set(paymentRef, {
    ...paymentData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "pending",
  })
}

export async function getPayments() {
  const paymentsRef = ref(database, "payments")
  const snapshot = await get(paymentsRef)
  return snapshot.val() || {}
}

export async function updatePayment(paymentId: string, updates: any) {
  const paymentRef = ref(database, `payments/${paymentId}`)
  return update(paymentRef, {
    ...updates,
    updatedAt: Date.now(),
  })
}
