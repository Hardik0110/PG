// Mock data for PG Manager - used as fallback when backend is unavailable
export const MOCK_USER = {
  id: "1f5d441c-fe30-4caf-afee-b38295c61607",
  email: "pgowner@test.com",
  full_name: "PG Owner",
  role: "owner",
  is_active: true,
  is_verified: false,
  phone_number: "+91 9876543210",
  profile_picture_url: null,
  auth_provider: "local",
};

export const MOCK_PGS = [
  { id: "pg-001", name: "Sunrise PG", type: "gents", address: "MG Road, Bangalore", city: "Bangalore", state: "Karnataka", pincode: "560001", description: "Premium AC rooms near tech park", amenities: ["WiFi", "AC", "Power Backup", "Laundry", "Meals Included", "Security", "TV", "Attached Bathroom"], owner_id: "1f5d441c-fe30-4caf-afee-b38295c61607", created_at: "2026-04-01T10:00:00Z" },
  { id: "pg-002", name: "Cozy Living PG", type: "coed", address: "Indiranagar, Bangalore", city: "Bangalore", state: "Karnataka", pincode: "560038", description: "Co-ed PG with modern amenities", amenities: ["WiFi", "AC", "Power Backup", "Parking", "Security", "TV"], owner_id: "1f5d441c-fe30-4caf-afee-b38295c61607", created_at: "2026-04-10T12:30:00Z" },
];

export const MOCK_TENANTS = [
  { id: "t-001", name: "Rahul Sharma", email: "rahul@test.com", phone_number: "+91 9876543001", pg_id: "pg-001", room_number: "101", rent: 8000, move_in_date: "2026-01-15" },
  { id: "t-002", name: "Priya Singh", email: "priya@test.com", phone_number: "+91 9876543002", pg_id: "pg-001", room_number: "102", rent: 8500, move_in_date: "2026-02-01" },
  { id: "t-003", name: "Amit Kumar", email: "amit@test.com", phone_number: "+91 9876543003", pg_id: "pg-001", room_number: "103", rent: 7500, move_in_date: "2026-03-01" },
  { id: "t-004", name: "Sneha Patel", email: "sneha@test.com", phone_number: "+91 9876543004", pg_id: "pg-002", room_number: "201", rent: 9000, move_in_date: "2026-01-20" },
  { id: "t-005", name: "Vikram Rao", email: "vikram@test.com", phone_number: "+91 9876543005", pg_id: "pg-002", room_number: "202", rent: 9500, move_in_date: "2026-02-15" },
  { id: "t-006", name: "Neha Gupta", email: "neha@test.com", phone_number: "+91 9876543006", pg_id: "pg-002", room_number: "203", rent: 8000, move_in_date: "2026-03-10" },
  { id: "t-007", name: "Arjun Mehta", email: "arjun@test.com", phone_number: "+91 9876543007", pg_id: "pg-001", room_number: "104", rent: 8000, move_in_date: "2026-04-01" },
  { id: "t-008", name: "Kavya Reddy", email: "kavya@test.com", phone_number: "+91 9876543008", pg_id: "pg-001", room_number: "105", rent: 8500, move_in_date: "2026-04-05" },
];

export const MOCK_NOTICES = [
  { id: "n-001", title: "Room availability", message: "Single AC room available from May 1st", created_by_name: "Rahul Sharma", pg_id: "pg-001", created_at: "2026-04-24T10:30:00Z", status: "new" },
  { id: "n-002", title: "Room with attached bathroom", message: "Is the room with attached bathroom available?", created_by_name: "Priya Singh", pg_id: "pg-001", created_at: "2026-04-23T15:45:00Z", status: "responded" },
  { id: "n-003", title: "Monthly rent query", message: "What is the monthly rent including meals?", created_by_name: "Amit Kumar", pg_id: "pg-001", created_at: "2026-04-22T11:15:00Z", status: "new" },
  { id: "n-004", title: "Shared room for 2", message: "Looking for shared room for 2 people", created_by_name: "Sneha Patel", pg_id: "pg-002", created_at: "2026-04-21T17:00:00Z", status: "responded" },
  { id: "n-005", title: "AC room needed", message: "Need AC room with WiFi, budget 10k", created_by_name: "Vikram Rao", pg_id: "pg-002", created_at: "2026-04-20T09:00:00Z", status: "new" },
  { id: "n-006", title: "Visit scheduled", message: "Can I visit on April 30th?", created_by_name: "Neha Gupta", pg_id: "pg-002", created_at: "2026-04-19T14:30:00Z", status: "responded" },
];

export const MOCK_TICKETS = [
  { id: "tk-001", title: "Water leakage in room 101", description: "Tap in bathroom is leaking continuously causing water wastage", category: "plumbing", priority: "high", status: "open", created_at: "2026-04-24T09:30:00Z", pg_id: "pg-001" },
  { id: "tk-002", title: "AC not cooling in room 102", description: "The AC is turning on but not cooling properly", category: "electrical", priority: "high", status: "open", created_at: "2026-04-23T14:15:00Z", pg_id: "pg-001" },
  { id: "tk-003", title: "Bed frame broken in room 103", description: "One leg of the bed is loose and needs repair", category: "furniture", priority: "medium", status: "in_progress", created_at: "2026-04-22T11:00:00Z", pg_id: "pg-001" },
  { id: "tk-004", title: "Window glass cracked in room 201", description: "Window pane in room 2 is cracked and needs replacement", category: "other", priority: "high", status: "open", created_at: "2026-04-21T16:30:00Z", pg_id: "pg-002" },
  { id: "tk-005", title: "Deep cleaning needed", description: "Common areas and hallway need thorough cleaning", category: "cleaning", priority: "low", status: "resolved", created_at: "2026-04-20T10:00:00Z", pg_id: "pg-001" },
  { id: "tk-006", title: "WiFi not working", description: "Internet connectivity is slow and frequently drops", category: "electrical", priority: "medium", status: "in_progress", created_at: "2026-04-19T08:45:00Z", pg_id: "pg-002" },
];

export const MOCK_ROOMS = [
  { id: "r-001", pg_id: "pg-001", room_number: "101", floor: 1, type: "single", rent: 8000, status: "occupied", amenities: ["AC", "Attached Bathroom"] },
  { id: "r-002", pg_id: "pg-001", room_number: "102", floor: 1, type: "single", rent: 8500, status: "occupied", amenities: ["AC", "Attached Bathroom"] },
  { id: "r-003", pg_id: "pg-001", room_number: "103", floor: 1, type: "shared", rent: 7500, status: "occupied", amenities: ["AC"] },
  { id: "r-004", pg_id: "pg-001", room_number: "104", floor: 1, type: "single", rent: 8000, status: "occupied", amenities: ["AC"] },
  { id: "r-005", pg_id: "pg-001", room_number: "105", floor: 1, type: "double", rent: 9500, status: "occupied", amenities: ["AC", "Attached Bathroom"] },
  { id: "r-006", pg_id: "pg-001", room_number: "201", floor: 2, type: "single", rent: 9000, status: "vacant", amenities: ["AC", "Balcony"] },
  { id: "r-007", pg_id: "pg-002", room_number: "201", floor: 2, type: "single", rent: 9000, status: "occupied", amenities: ["AC"] },
  { id: "r-008", pg_id: "pg-002", room_number: "202", floor: 2, type: "double", rent: 11000, status: "occupied", amenities: ["AC", "Attached Bathroom"] },
  { id: "r-009", pg_id: "pg-002", room_number: "203", floor: 2, type: "shared", rent: 8000, status: "occupied", amenities: ["AC"] },
  { id: "r-010", pg_id: "pg-002", room_number: "204", floor: 2, type: "single", rent: 8500, status: "vacant", amenities: ["AC"] },
];

export const MOCK_AMENITIES = [
  { id: "am-001", name: "WiFi", category: "connectivity" },
  { id: "am-002", name: "AC", category: "comfort" },
  { id: "am-003", name: "Power Backup", category: "utilities" },
  { id: "am-004", name: "Laundry", category: "cleaning" },
  { id: "am-005", name: "Meals Included", category: "food" },
  { id: "am-006", name: "Parking", category: "facility" },
  { id: "am-007", name: "Security", category: "safety" },
  { id: "am-008", name: "TV", category: "entertainment" },
  { id: "am-009", name: "Attached Bathroom", category: "comfort" },
  { id: "am-010", name: "Balcony", category: "comfort" },
];

export function getMockData(path) {
  if (path.includes('/auth/me')) return MOCK_USER;
  if (path.includes('/pg-facilities/') && !path.includes('/pg-facilities/')) return MOCK_PGS;
  if (path.includes('/pg-facilities/')) {
    const id = path.split('/pg-facilities/')[1];
    return MOCK_PGS.find(p => p.id === id) || MOCK_PGS[0];
  }
  if (path.includes('/tenants/')) return MOCK_TENANTS;
  if (path.includes('/notices/')) return MOCK_NOTICES;
  if (path.includes('/tickets/my')) return MOCK_TICKETS;
  if (path.includes('/rooms/')) return MOCK_ROOMS;
  if (path.includes('/amenities/')) return MOCK_AMENITIES;
  return [];
}
