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
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

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
    const newStreak = (stats.streak || 0) + 1;
    await setDoc(doc(db, 'users', effectiveUid, 'stats', 'learning'), {
      streak: newStreak,
      lastCheckIn: Timestamp.now()
    }, { merge: true });
  };

  return { stats, loading, checkIn, isReadOnly };
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
