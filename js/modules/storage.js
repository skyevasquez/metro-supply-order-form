/**
 * Storage utilities for the supply order system
 */

/**
 * Save draft to localStorage
 * @param {Object} formData - Form data to save
 */
export function saveDraft(formData) {
    localStorage.setItem('orderDraft', JSON.stringify(formData));
}

/**
 * Load draft from localStorage
 * @returns {Object|null} Draft data or null
 */
export function loadDraft() {
    const draft = localStorage.getItem('orderDraft');
    if (draft) {
        try {
            return JSON.parse(draft);
        } catch (error) {
            console.error('Error parsing draft:', error);
            localStorage.removeItem('orderDraft');
        }
    }
    return null;
}

/**
 * Clear draft from localStorage
 */
export function clearDraft() {
    localStorage.removeItem('orderDraft');
}

/**
 * Populate form with draft data
 * @param {Object} draft - Draft data
 */
export function populateFormWithDraft(draft) {
    // Populate basic fields
    if (draft.employeeName) {
        const employeeNameInput = document.getElementById('employeeName');
        if (employeeNameInput) employeeNameInput.value = draft.employeeName;
    }

    if (draft.store) {
        const storeSelect = document.getElementById('store');
        if (storeSelect) storeSelect.value = draft.store;
    }

    if (draft.orderDate) {
        const orderDateInput = document.getElementById('orderDate');
        if (orderDateInput) orderDateInput.value = draft.orderDate;
    }

    if (draft.notes) {
        const notesInput = document.getElementById('notes');
        if (notesInput) notesInput.value = draft.notes;
    }

    // Populate supplies (implementation would be more complex)
    // This is a simplified version that just logs the draft
    console.log('Draft loaded:', draft);
}

/**
 * Auto-save draft functionality
 * @param {Function} getFormData - Function to get current form data
 * @param {number} interval - Auto-save interval in milliseconds
 * @returns {number} Interval ID
 */
export function setupAutoSave(getFormData, interval = 30000) {
    return setInterval(() => {
        const formData = getFormData();
        if (formData) {
            saveDraft(formData);
            console.log('Draft auto-saved');
        }
    }, interval);
}

/**
 * Get all saved orders from localStorage
 * @returns {Array} Array of orders
 */
export function getSavedOrders() {
    try {
        return JSON.parse(localStorage.getItem('supplyOrders') || '[]');
    } catch (error) {
        console.error('Error loading saved orders:', error);
        return [];
    }
}

/**
 * Clear all saved data from localStorage
 */
export function clearAllData() {
    localStorage.removeItem('supplyOrders');
    localStorage.removeItem('orderDraft');
    console.log('All local data cleared');
}