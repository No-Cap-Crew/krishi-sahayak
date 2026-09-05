export type BookingStatus = "Scheduled" | "Completed" | "Pending";

export interface Booking {
  id: string;
  farmer: string;
  phone: string;
  village: string;
  crop: string;
  quantityQuintals: number;
  date: string;
  slot: string;
  status: BookingStatus;
  paid: boolean;
}

export const demoBookings: Booking[] = [
  { id: "KS-1042", farmer: "Ramesh Kumar", phone: "9876501234", village: "Rampur, Meerut", crop: "Wheat", quantityQuintals: 28, date: "2026-08-30", slot: "Morning", status: "Scheduled", paid: false },
  { id: "KS-1043", farmer: "Sunita Devi", phone: "9876502345", village: "Kheri, Lakhimpur", crop: "Paddy (Rice)", quantityQuintals: 42, date: "2026-08-30", slot: "Morning", status: "Scheduled", paid: false },
  { id: "KS-1044", farmer: "Harjeet Singh", phone: "9876503456", village: "Nabha, Patiala", crop: "Wheat", quantityQuintals: 35, date: "2026-08-30", slot: "Afternoon", status: "Completed", paid: true },
  { id: "KS-1045", farmer: "Lakshmi Bai", phone: "9876504567", village: "Guntur", crop: "Cotton", quantityQuintals: 18, date: "2026-08-30", slot: "Afternoon", status: "Scheduled", paid: false },
  { id: "KS-1046", farmer: "Mohan Patel", phone: "9876505678", village: "Anand, Gujarat", crop: "Mustard", quantityQuintals: 22, date: "2026-08-30", slot: "Morning", status: "Pending", paid: false },
  { id: "KS-1047", farmer: "Anil Yadav", phone: "9876506789", village: "Azamgarh", crop: "Sugarcane", quantityQuintals: 60, date: "2026-08-30", slot: "Afternoon", status: "Scheduled", paid: false },
];

export function findBooking(query: string): Booking | undefined {
  const q = query.trim().toLowerCase();
  return demoBookings.find(
    (b) => b.id.toLowerCase() === q || b.phone === q
  );
}

export function nextBookingId(): string {
  return `KS-${1048 + Math.floor(Math.random() * 900)}`;
}
