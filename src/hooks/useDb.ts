import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp,
  orderBy,
  setDoc,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { differenceInDays } from 'date-fns';

// Helper to get effective UID and check permissions
const useDbUtils = () => {
  const { user, profile } = useAuth();
  
  const effectiveUid = useMemo(() => {
    if (!user) return null;
    if (profile?.role === 'parent' && profile.childId) {
      return profile.childId;
    }
    return user.uid;
  }, [user, profile]);

  const isReadOnly = useMemo(() => {
    return profile?.role === 'parent';
  }, [profile]);

  return { effectiveUid, isReadOnly, user, profile };
};

export const useHomeworks = () => {
  const { effectiveUid, isReadOnly } = useDbUtils();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveUid) return;

    const q = query(
      collection(db, 'users', effectiveUid, 'homeworks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveUid]);

  const addHomework = async (title: string) => {
    if (!effectiveUid || isReadOnly) return;
    await addDoc(collection(db, 'users', effectiveUid, 'homeworks'), {
      title,
      completed: false,
      createdAt: Timestamp.now()
    });
  };

  const toggleHomework = async (id: string, currentStatus: boolean) => {
    if (!effectiveUid || isReadOnly) return;
    const docRef = doc(db, 'users', effectiveUid, 'homeworks', id);
    await updateDoc(docRef, { completed: !currentStatus });
  };

  return { data, loading, addHomework, toggleHomework, isReadOnly };
};

export const useMistakes = () => {
  const { effectiveUid, isReadOnly } = useDbUtils();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveUid) return;

    const q = query(
      collection(db, 'users', effectiveUid, 'mistakes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveUid]);

  const addMistake = async (mistake: any) => {
    if (!effectiveUid || isReadOnly) return;
    await addDoc(collection(db, 'users', effectiveUid, 'mistakes'), {
      ...mistake,
      createdAt: Timestamp.now()
    });
  };

  const toggleReviewed = async (id: string, currentStatus: boolean) => {
    if (!effectiveUid || isReadOnly) return;
    const docRef = doc(db, 'users', effectiveUid, 'mistakes', id);
    await updateDoc(docRef, { reviewed: !currentStatus });
  };

  return { data, loading, addMistake, toggleReviewed, isReadOnly };
};

export const useUserStats = () => {
  const { effectiveUid, isReadOnly } = useDbUtils();
  const [stats, setStats] = useState({ streak: 0, lastCheckIn: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveUid) return;

    const docRef = doc(db, 'users', effectiveUid, 'stats', 'learning');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as any);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveUid]);

  const checkIn = async () => {
    if (!effectiveUid || isReadOnly) return;
    
    const today = new Date();
    const dateKey = today.toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Check for streak reset
    let newStreak = (stats.streak || 0) + 1;
    if (stats.lastCheckIn) {
      const lastDate = (stats.lastCheckIn as Timestamp).toDate();
      const diffDays = differenceInDays(today, lastDate);
      
      if (diffDays > 1) {
        // More than a day missed, reset to 1
        newStreak = 1;
      } else if (diffDays === 0) {
        // Already checked in today, do nothing to prevent double counting
        return;
      }
    }

    // Update streak stats
    await setDoc(doc(db, 'users', effectiveUid, 'stats', 'learning'), {
      streak: newStreak,
      lastCheckIn: Timestamp.now()
    }, { merge: true });

    // Write daily attendance record
    await setDoc(doc(db, 'users', effectiveUid, 'attendance', dateKey), {
      checkedIn: true,
      checkInTime: Timestamp.now()
    });
  };

  return { stats, loading, checkIn, isReadOnly };
};

export const useCheckInHistory = () => {
  const { effectiveUid } = useDbUtils();
  const [checkedInDates, setCheckedInDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveUid) return;

    const q = query(collection(db, 'users', effectiveUid, 'attendance'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dates = new Set(snapshot.docs.map(d => d.id)); // doc ID is YYYY-MM-DD
      setCheckedInDates(dates);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveUid]);

  return { checkedInDates, loading };
};

export const useDetailedCheckInHistory = () => {
  const { effectiveUid } = useDbUtils();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveUid) return;

    const q = query(
      collection(db, 'users', effectiveUid, 'attendance'),
      orderBy('checkInTime', 'desc'),
      limit(7)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveUid]);

  return { history, loading };
};

export const useTimerLogs = () => {
  const { effectiveUid, isReadOnly } = useDbUtils();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!effectiveUid) return;

    const q = query(
      collection(db, 'users', effectiveUid, 'timerLogs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveUid]);

  const addTimerLog = async (log: any) => {
    if (!effectiveUid || isReadOnly) return;
    await addDoc(collection(db, 'users', effectiveUid, 'timerLogs'), {
      ...log,
      timestamp: Timestamp.now()
    });
  };

  return { logs, loading, addTimerLog, isReadOnly };
};
