/**
 * Main application script for the supply order system
 */
import { checkAuthStatus, getCurrentUser, showUserInfo, handleSignOut, preFillFormWithUserData } from './js/modules/auth.js';
import { addSupplyItem, removeSupplyItem, collectFormData, validateFormData, resetForm, resetSupplySection, setTodayDate } from './js/modules/formManager.js';
import { submitOrder, saveToFirestore, saveOrderToStorage, exportOrderData } from './js/modules/apiService.js';
import { formatDate, generatePreviewContent, showSuccessMessage, setFormLoading, showOrderPreview, closeOrderPreview, setupModalHandlers } from './js/modules/uiManager.js';
import { saveDraft, loadDraft, populateFormWithDraft, setupAutoSave, clearDraft } from './js/modules/storage.js';

// Global variables
let autoSaveInterval = null;

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Set today's date as default
        setTodayDate();

        // Setup modal handlers
        setupModalHandlers();

        // Add form submission handler
        document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);

        // Check authentication status
        const user = await checkAuthStatus();
        if (user) {
            showUserInfo(user);
            preFillFormWithUserData(user);
        }

        // Load draft if exists
        const draft = loadDraft();
        if (draft) {
            if (confirm('Found a saved draft. Would you like to load it?')) {
                populateFormWithDraft(draft);
            } else {
                clearDraft();
            }
        }

        // Setup auto-save
        setupAutoSave(() => {
            const formData = collectFormData();
            return formData.employeeName ? formData : null;
        });

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

/**
 * Preview the order before submission
 */
function previewOrder() {
    const formData = collectFormData();

    if (!validateFormData(formData)) {
        return;
    }

    showOrderPreview(formData);
}

/**
 * Close the preview modal
 */
function closePreview() {
    closeOrderPreview();
}

/**
 * Submit order from preview modal
 */
async function submitFromPreview() {
    closePreview();
    await submitOrder();
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = collectFormData();

    if (!validateFormData(formData)) {
        return;
    }

    await submitOrderRequest(formData);
}

/**
 * Submit order request
 */
async function submitOrderRequest(formData) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        showSuccessMessage('Please sign in to submit an order.', 'error');
        setTimeout(() => {
            window.location.href = '/auth.html';
        }, 2000);
        return;
    }

    setFormLoading(true);

    try {
        const result = await submitOrder(formData, currentUser);

        if (result.success) {
            // Save to Firestore if available
            await saveToFirestore(formData, currentUser, result);

            // Also save to localStorage as backup
            saveOrderToStorage({
                ...formData,
                emailSent: true,
                messageId: result.messageId
            });

            showSuccessMessage('Order submitted successfully! Email has been sent to management.');

            // Clear draft after successful submission
            clearDraft();

            // Reset form
            resetFormAfterSubmission(currentUser);
        } else {
            throw new Error(result.message || 'Failed to submit order');
        }
    } catch (error) {
        console.error('❌ Error submitting order:', error);

        // Fallback: save locally and show error
        saveOrderToStorage({
            ...formData,
            emailSent: false,
            error: error.message
        });

        showSuccessMessage('Order saved locally. Please check your internet connection and try again, or contact IT support.', 'error');
    } finally {
        setFormLoading(false);
    }
}

/**
 * Reset form after successful submission
 */
function resetFormAfterSubmission(currentUser) {
    // Reset form
    resetForm();

    // Pre-fill employee name again
    if (currentUser) {
        preFillFormWithUserData(currentUser);
    }

    // Clear dynamic items and add default ones
    document.getElementById('officeSupplies').innerHTML = '';
    document.getElementById('cleaningSupplies').innerHTML = '';
    addSupplyItem('officeSupplies');
    addSupplyItem('cleaningSupplies');
}

/**
 * Reset form for new order
 */
function resetNewOrder() {
    if (confirm('Are you sure you want to reset the form? Any unsaved data will be lost.')) {
        clearDraft();
        resetForm();
    }
}

/**
 * Handle keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (event) {
        // Ctrl/Cmd + S to save draft
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            const formData = collectFormData();
            if (formData.employeeName) {
                saveDraft(formData);
                showSuccessMessage('Draft saved successfully!');
            }
        }

        // Ctrl/Cmd + Shift + C to clear draft
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
            event.preventDefault();
            clearDraft();
            showSuccessMessage('Draft cleared!');
        }
    });
}

/**
 * Export functions to global scope for inline event handlers
 */
window.addSupplyItem = addSupplyItem;
window.removeSupplyItem = removeSupplyItem;
window.handleSignOut = handleSignOut;
window.previewOrder = previewOrder;
window.closePreview = closePreview;
window.submitFromPreview = submitFromPreview;
window.resetForm = resetNewOrder;
window.exportOrderData = exportOrderData;

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupKeyboardShortcuts();

    // Console command to export data (for admin use)
    console.log('To export all order data, run: exportOrderData()');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
});