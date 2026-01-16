import { useState, useEffect, useCallback } from 'react';
import { CheckInRecord, EmergencyContact } from '../types';

const STORAGE_KEY = 'dead-yet-app';

interface StoredData {
  lastCheckIn: number | null;
  checkInHistory: CheckInRecord[];
  emergencyContacts: EmergencyContact[];
}

const getStoredData = (): StoredData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    lastCheckIn: null,
    checkInHistory: [],
    emergencyContacts: [],
  };
};

const saveData = (data: StoredData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const useCheckIn = () => {
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    const data = getStoredData();
    setLastCheckIn(data.lastCheckIn);
    setCheckInHistory(data.checkInHistory);
    setEmergencyContacts(data.emergencyContacts);
  }, []);

  const checkIn = useCallback(() => {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    const newRecord: CheckInRecord = {
      id: crypto.randomUUID(),
      date: today,
      timestamp: now,
    };

    setLastCheckIn(now);
    setCheckInHistory(prev => {
      // Remove duplicate entries for today
      const filtered = prev.filter(r => r.date !== today);
      const updated = [newRecord, ...filtered].slice(0, 30); // Keep last 30 days

      saveData({
        lastCheckIn: now,
        checkInHistory: updated,
        emergencyContacts,
      });

      return updated;
    });
  }, [emergencyContacts]);

  const addContact = useCallback((name: string, email: string) => {
    const newContact: EmergencyContact = {
      id: crypto.randomUUID(),
      name,
      email,
    };

    setEmergencyContacts(prev => {
      const updated = [...prev, newContact];
      saveData({
        lastCheckIn,
        checkInHistory,
        emergencyContacts: updated,
      });
      return updated;
    });
  }, [lastCheckIn, checkInHistory]);

  const removeContact = useCallback((id: string) => {
    setEmergencyContacts(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveData({
        lastCheckIn,
        checkInHistory,
        emergencyContacts: updated,
      });
      return updated;
    });
  }, [lastCheckIn, checkInHistory]);

  const getHoursSinceLastCheckIn = useCallback(() => {
    if (!lastCheckIn) return null;
    return (Date.now() - lastCheckIn) / (1000 * 60 * 60);
  }, [lastCheckIn]);

  const getStatus = useCallback(() => {
    const hours = getHoursSinceLastCheckIn();
    if (hours === null) return 'never';
    if (hours < 24) return 'safe';
    if (hours < 48) return 'warning';
    return 'danger';
  }, [getHoursSinceLastCheckIn]);

  return {
    lastCheckIn,
    checkInHistory,
    emergencyContacts,
    checkIn,
    addContact,
    removeContact,
    getHoursSinceLastCheckIn,
    getStatus,
  };
};
