import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config.js';

// Collections
export const ordersCollection = collection(db, 'orders');
export const usersCollection = collection(db, 'users');
export const storesCollection = collection(db, 'stores');

/**
 * Create a new order in Firestore
 */
export async function createOrder(orderData) {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      submittedAt: Timestamp.now(),
      status: 'pending',
      emailSent: orderData.emailSent || false,
      statusHistory: [
        {
          status: 'pending',
          timestamp: Timestamp.now(),
          updatedBy: 'system'
        }
      ]
    });
    
    console.log('✅ Order created with ID:', docRef.id);
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

/**
 * Get user's order history
 */
export async function getUserOrders(userId, limitCount = 10) {
  try {
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, newStatus, updatedBy) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const currentHistory = orderDoc.data().statusHistory || [];
    
    await updateDoc(orderRef, {
      status: newStatus,
      statusHistory: [
        ...currentHistory,
        {
          status: newStatus,
          timestamp: Timestamp.now(),
          updatedBy: updatedBy
        }
      ]
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
}

/**
 * Get all orders for a specific store
 */
export async function getStoreOrders(storeName, limitCount = 50) {
  try {
    const q = query(
      ordersCollection,
      where('store', '==', storeName),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('❌ Error fetching store orders:', error);
    throw error;
  }
}

/**
 * Create or update user profile
 */
export async function createUserProfile(uid, userData) {
  try {
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, {
      uid,
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid, userData) {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
}
