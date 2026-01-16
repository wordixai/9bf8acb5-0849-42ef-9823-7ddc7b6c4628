export interface CheckInRecord {
  id: string;
  date: string;
  timestamp: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  email: string;
}

export interface AppState {
  lastCheckIn: number | null;
  checkInHistory: CheckInRecord[];
  emergencyContacts: EmergencyContact[];
}
