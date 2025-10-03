/**
 * API service module for the supply order system
 */

/**
 * Submit order to Firebase Functions
 * @param {Object} formData - Form data
 * @param {Object} currentUser - Current user object
 * @returns {Promise<Object>} Server response
 */
export async function submitOrder(formData, currentUser) {
    // Check if user is authenticated
    if (!currentUser) {
        throw new Error('User not authenticated');
    }

    console.log('📤 Sending order data:', formData);

    try {
        // Import Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js');
        const functions = getFunctions();

        // Call the submitOrder function
        const submitOrderFunction = httpsCallable(functions, 'submitOrder');

        const result = await submitOrderFunction({
            // User Information (from Firebase Auth)
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userEmail: currentUser.email,
            userPhone: currentUser.phoneNumber,
            userRole: currentUser.role,

            // Order Details
            employeeName: formData.employeeName,
            store: formData.store,
            orderDate: formData.orderDate,
            officeSupplies: formData.officeSupplies,
            cleaningSupplies: formData.cleaningSupplies,
            additionalNotes: formData.notes,

            // Metadata
            totalItems: formData.officeSupplies.length + formData.cleaningSupplies.length
        });

        console.log('📥 Firebase Functions response:', result);
        return result.data;

    } catch (error) {
        console.error('❌ Error calling Firebase Functions:', error);

        // Handle Firebase Functions specific errors
        if (error.code === 'unauthenticated') {
            throw new Error('You must be logged in to submit orders');
        } else if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to submit orders');
        } else if (error.details) {
            throw new Error(error.details);
        } else {
            throw new Error('Failed to submit order: ' + error.message);
        }
    }
}

/**
 * Save order to Firestore if available
 * @param {Object} formData - Form data
 * @param {Object} currentUser - Current user object
 * @param {Object} emailResult - Email send result
 */
export async function saveToFirestore(formData, currentUser, emailResult) {
    try {
        const { createOrder } = await import('../src/firebase/firestore.js');
        await createOrder({
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userEmail: currentUser.email,
            userPhone: currentUser.phoneNumber,
            store: formData.store,
            orderDate: formData.orderDate,
            officeSupplies: formData.officeSupplies,
            cleaningSupplies: formData.cleaningSupplies,
            additionalNotes: formData.notes,
            emailSent: true,
            emailSentAt: new Date(),
            emailMessageId: emailResult.messageId,
            totalItems: formData.officeSupplies.length + formData.cleaningSupplies.length
        });
        console.log('✅ Order saved to Firestore');
    } catch (firestoreError) {
        console.warn('⚠️ Could not save to Firestore:', firestoreError);
        // Continue anyway - email was sent successfully
    }
}

/**
 * Save order to localStorage (for demonstration purposes)
 * @param {Object} orderData - Order data
 */
export function saveOrderToStorage(orderData) {
    const orders = JSON.parse(localStorage.getItem('supplyOrders') || '[]');
    const orderWithId = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...orderData
    };
    orders.push(orderWithId);
    localStorage.setItem('supplyOrders', JSON.stringify(orders));
}

/**
 * Export order data as JSON (for debugging/admin purposes)
 */
export function exportOrderData() {
    const orders = JSON.parse(localStorage.getItem('supplyOrders') || '[]');
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'supply_orders.json';
    link.click();
}