import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, SavingsGoal, Investment } from '../types/finance';
import { useAuth } from '../context/AuthContext';

export const useFinance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setInvestments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const qTransactions = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    const qGoals = query(collection(db, `users/${user.uid}/goals`));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingsGoal)));
    });

    const qInvestments = query(collection(db, `users/${user.uid}/investments`));
    const unsubInvestments = onSnapshot(qInvestments, (snapshot) => {
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment)));
      setIsLoading(false);
    });

    return () => {
      unsubTransactions();
      unsubGoals();
      unsubInvestments();
    };
  }, [user]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      ...data,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const addGoal = async (data: Omit<SavingsGoal, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/goals`), {
      ...data,
      userId: user.uid
    });
  };

  const updateGoalProgress = async (goalId: string, amount: number) => {
    if (!user) return;
    const goalRef = doc(db, `users/${user.uid}/goals`, goalId);
    await updateDoc(goalRef, { currentAmount: amount });
  };

  const addInvestment = async (data: Omit<Investment, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/investments`), {
      ...data,
      userId: user.uid
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
  };

  return {
    transactions,
    goals,
    investments,
    isLoading,
    addTransaction,
    addGoal,
    updateGoalProgress,
    addInvestment,
    deleteTransaction
  };
};
