import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CheckInRecord, EmergencyContact } from '../types';
import { useAuth } from './useAuth';

export const useCheckIn = () => {
  const { user, isAuthenticated } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // 获取用户档案
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_check_in')
          .eq('user_id', user.id)
          .single();

        if (profile?.last_check_in) {
          setLastCheckIn(new Date(profile.last_check_in).getTime());
        }

        // 获取签到记录
        const { data: checkIns } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .order('checked_in_at', { ascending: false })
          .limit(30);

        if (checkIns) {
          setCheckInHistory(
            checkIns.map((c) => ({
              id: c.id,
              date: c.date,
              timestamp: new Date(c.checked_in_at).getTime(),
            }))
          );
        }

        // 获取紧急联系人
        const { data: contacts } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id);

        if (contacts) {
          setEmergencyContacts(
            contacts.map((c) => ({
              id: c.id,
              name: c.name,
              email: c.email,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAuthenticated]);

  const checkIn = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    try {
      // 插入签到记录
      const { data: newCheckIn, error: checkInError } = await supabase
        .from('check_ins')
        .upsert(
          {
            user_id: user.id,
            date: today,
            checked_in_at: new Date(now).toISOString(),
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single();

      if (checkInError) throw checkInError;

      // 更新用户档案
      await supabase
        .from('profiles')
        .update({
          last_check_in: new Date(now).toISOString(),
          notification_sent: false, // 重置通知状态
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // 更新本地状态
      setLastCheckIn(now);
      setCheckInHistory((prev) => {
        const filtered = prev.filter((r) => r.date !== today);
        return [
          {
            id: newCheckIn?.id || crypto.randomUUID(),
            date: today,
            timestamp: now,
          },
          ...filtered,
        ].slice(0, 30);
      });
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }, [user]);

  const addContact = useCallback(
    async (name: string, email: string) => {
      if (!user) return;

      try {
        const { data: newContact, error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name,
            email,
          })
          .select()
          .single();

        if (error) throw error;

        if (newContact) {
          setEmergencyContacts((prev) => [
            ...prev,
            {
              id: newContact.id,
              name: newContact.name,
              email: newContact.email,
            },
          ]);
        }
      } catch (error) {
        console.error('Error adding contact:', error);
        throw error;
      }
    },
    [user]
  );

  const removeContact = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('emergency_contacts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Error removing contact:', error);
        throw error;
      }
    },
    [user]
  );

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

  // 手动触发发送警报邮件（测试用）
  const sendAlertEmail = useCallback(async () => {
    if (emergencyContacts.length === 0) {
      throw new Error('No emergency contacts configured');
    }

    const { data, error } = await supabase.functions.invoke('send-alert-email', {
      body: {
        contacts: emergencyContacts,
        userName: user?.email || '用户',
        lastCheckIn: lastCheckIn
          ? new Date(lastCheckIn).toLocaleString('zh-CN')
          : null,
      },
    });

    if (error) throw error;
    return data;
  }, [emergencyContacts, user, lastCheckIn]);

  return {
    lastCheckIn,
    checkInHistory,
    emergencyContacts,
    checkIn,
    addContact,
    removeContact,
    getHoursSinceLastCheckIn,
    getStatus,
    sendAlertEmail,
    loading,
  };
};
