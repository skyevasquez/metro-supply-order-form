// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Add form submission handler
    document.getElementById('orderForm').addEventListener('submit', handleFormSubmit);
    
    // Check authentication status
    checkAuthStatus();
});

// Check if user is authenticated
function checkAuthStatus() {
    // Import Firebase auth dynamically
    import('./src/firebase/auth.js').then(({ onAuthChange }) => {
        onAuthChange(({ user, profile }) => {
            if (!user) {
                // Not authenticated, redirect to login
                window.location.href = '/auth.html';
            } else {
                // Authenticated, store user info globally
                window.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || profile?.displayName || 'User',
                    store: profile?.store || '',
                    phoneNumber: profile?.phoneNumber || '',
                    role: profile?.role || 'employee'
                };
                
                // Pre-fill store field if user has assigned store
                if (profile?.store) {
                    const storeSelect = document.getElementById('store');
                    if (storeSelect) {
                        storeSelect.value = profile.store;
                    }
                }
                
                // Pre-fill employee name
                const employeeNameInput = document.getElementById('employeeName');
                if (employeeNameInput && !employeeNameInput.value) {
                    employeeNameInput.value = window.currentUser.displayName;
                }
                
                // Show user info in header
                showUserInfo(window.currentUser);
            }
        });
    }).catch((error) => {
        console.error('Failed to load Firebase auth:', error);
        // If Firebase fails to load, continue anyway (fallback to no auth)
    });
}

// Show user info in header
function showUserInfo(user) {
    const headerMeta = document.querySelector('.header-meta');
    if (headerMeta) {
        headerMeta.innerHTML = `
            <span style="margin-right: 15px;">👤 ${user.displayName}</span>
            <button onclick="handleSignOut()" style="padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 6px; cursor: pointer; font-size: 14px;">Sign Out</button>
        `;
    }
}

// Handle sign out
window.handleSignOut = async function() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            const { signOutUser } = await import('./src/firebase/auth.js');
            await signOutUser();
            window.location.href = '/auth.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    }
};

// Add a new supply item to the specified section
function addSupplyItem(sectionId) {
    const container = document.getElementById(sectionId);
    const newItem = document.createElement('div');
    newItem.className = 'supply-item';
    
    newItem.innerHTML = `
        <div class="supply-inputs">
            <input type="text" placeholder="Item name" class="item-name">
            <input type="number" placeholder="Quantity" class="item-quantity" min="1">
            <button type="button" class="remove-item" onclick="removeSupplyItem(this)">Remove</button>
        </div>
    `;
    
    container.appendChild(newItem);
    
    // Focus on the new item name input
    const newInput = newItem.querySelector('.item-name');
    newInput.focus();
    
    // Add animation
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateY(20px)';
    setTimeout(() => {
        newItem.style.transition = 'all 0.3s ease';
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
    }, 10);
}

// Remove a supply item
function removeSupplyItem(button) {
    const item = button.closest('.supply-item');
    const container = item.parentNode;
    
    // Don't remove if it's the last item in the section
    if (container.children.length <= 1) {
        alert('At least one item must remain in each section.');
        return;
    }
    
    // Add animation before removal
    item.style.transition = 'all 0.3s ease';
    item.style.opacity = '0';
    item.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
        item.remove();
    }, 300);
}

// Preview the order before submission
function previewOrder() {
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    const previewContent = generatePreviewContent(formData);
    document.getElementById('previewContent').innerHTML = previewContent;
    document.getElementById('previewModal').style.display = 'block';
}

// Close the preview modal
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Submit order from preview modal
async function submitFromPreview() {
    closePreview();
    await submitOrder();
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    await submitOrder();
}

// Collect all form data
function collectFormData() {
    const employeeName = document.getElementById('employeeName').value.trim();
    const store = document.getElementById('store').value;
    const orderDate = document.getElementById('orderDate').value;
    const notes = document.getElementById('notes').value.trim();
    
    // Collect office supplies
    const officeSupplies = [];
    const officeItems = document.querySelectorAll('#officeSupplies .supply-item');
    officeItems.forEach(item => {
        const name = item.querySelector('.item-name').value.trim();
        const quantity = item.querySelector('.item-quantity').value;
        if (name && quantity) {
            officeSupplies.push({ name, quantity: parseInt(quantity) });
        }
    });
    
    // Collect cleaning supplies
    const cleaningSupplies = [];
    const cleaningItems = document.querySelectorAll('#cleaningSupplies .supply-item');
    cleaningItems.forEach(item => {
        const name = item.querySelector('.item-name').value.trim();
        const quantity = item.querySelector('.item-quantity').value;
        if (name && quantity) {
            cleaningSupplies.push({ name, quantity: parseInt(quantity) });
        }
    });
    
    return {
        employeeName,
        store,
        orderDate,
        officeSupplies,
        cleaningSupplies,
        notes
    };
}

// Validate form data
function validateFormData(data) {
    if (!data.employeeName) {
        alert('Please enter your name.');
        document.getElementById('employeeName').focus();
        return false;
    }
    
    if (!data.store) {
        alert('Please select a store.');
        document.getElementById('store').focus();
        return false;
    }
    
    if (!data.orderDate) {
        alert('Please select an order date.');
        document.getElementById('orderDate').focus();
        return false;
    }
    
    if (data.officeSupplies.length === 0 && data.cleaningSupplies.length === 0) {
        alert('Please add at least one supply item.');
        return false;
    }
    
    return true;
}

// Generate preview content HTML
function generatePreviewContent(data) {
    let html = `
        <div class="preview-section">
            <h3>Order Information</h3>
            <div class="preview-item">
                <strong>Employee Name:</strong>
                <span>${data.employeeName}</span>
            </div>
            <div class="preview-item">
                <strong>Store:</strong>
                <span>${data.store}</span>
            </div>
            <div class="preview-item">
                <strong>Order Date:</strong>
                <span>${formatDate(data.orderDate)}</span>
            </div>
        </div>
    `;
    
    if (data.officeSupplies.length > 0) {
        html += `
            <div class="preview-section">
                <h3>Office Supplies</h3>
        `;
        data.officeSupplies.forEach(item => {
            html += `
                <div class="preview-item">
                    <span>${item.name}</span>
                    <span>Qty: ${item.quantity}</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    if (data.cleaningSupplies.length > 0) {
        html += `
            <div class="preview-section">
                <h3>Cleaning Supplies</h3>
        `;
        data.cleaningSupplies.forEach(item => {
            html += `
                <div class="preview-item">
                    <span>${item.name}</span>
                    <span>Qty: ${item.quantity}</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    if (data.notes) {
        html += `
            <div class="preview-section">
                <h3>Additional Notes</h3>
                <p>${data.notes}</p>
            </div>
        `;
    }
    
    return html;
}

// Submit the order
async function submitOrder() {
    const formData = collectFormData();
    
    // Check if user is authenticated
    if (!window.currentUser) {
        showSuccessMessage('Please sign in to submit an order.', 'error');
        setTimeout(() => {
            window.location.href = '/auth.html';
        }, 2000);
        return;
    }
    
    // Add loading state
    const form = document.getElementById('orderForm');
    const submitBtn = document.querySelector('.submit-btn');
    
    form.classList.add('loading');
    submitBtn.textContent = 'Sending Order...';
    submitBtn.disabled = true;
    
    try {
        console.log('📤 Sending order data:', formData);
        
        // Get user's ID token for authentication
        let idToken = null;
        try {
            const { getCurrentUserToken } = await import('./src/firebase/auth.js');
            idToken = await getCurrentUserToken();
        } catch (error) {
            console.warn('Could not get auth token:', error);
        }
        
        // Send to server with user information
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (idToken) {
            headers['Authorization'] = `Bearer ${idToken}`;
        }
        
        const response = await fetch('/api/submit-order', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                // User Information (from Firebase Auth)
                userId: window.currentUser.uid,
                userName: window.currentUser.displayName,
                userEmail: window.currentUser.email,
                userPhone: window.currentUser.phoneNumber,
                userRole: window.currentUser.role,
                
                // Order Details
                employeeName: formData.employeeName,
                store: formData.store,
                orderDate: formData.orderDate,
                officeSupplies: formData.officeSupplies,
                cleaningSupplies: formData.cleaningSupplies,
                additionalNotes: formData.notes,
                
                // Metadata
                totalItems: formData.officeSupplies.length + formData.cleaningSupplies.length
            })
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        console.log('📡 Response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const responseText = await response.text();
        console.log('📥 Raw response text:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('📥 Parsed JSON response:', result);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('❌ Response text that failed to parse:', responseText);
            throw new Error(`Failed to parse server response: ${parseError.message}`);
        }
        
        if (result.success) {
            // Save to Firestore if available
            try {
                const { createOrder } = await import('./src/firebase/firestore.js');
                await createOrder({
                    userId: window.currentUser.uid,
                    userName: window.currentUser.displayName,
                    userEmail: window.currentUser.email,
                    userPhone: window.currentUser.phoneNumber,
                    store: formData.store,
                    orderDate: formData.orderDate,
                    officeSupplies: formData.officeSupplies,
                    cleaningSupplies: formData.cleaningSupplies,
                    additionalNotes: formData.notes,
                    emailSent: true,
                    emailSentAt: new Date(),
                    emailMessageId: result.messageId,
                    totalItems: formData.officeSupplies.length + formData.cleaningSupplies.length
                });
                console.log('✅ Order saved to Firestore');
            } catch (firestoreError) {
                console.warn('⚠️ Could not save to Firestore:', firestoreError);
                // Continue anyway - email was sent successfully
            }
            
            // Also save to localStorage as backup
            saveOrderToStorage({
                ...formData,
                emailSent: true,
                messageId: result.messageId
            });
            
            showSuccessMessage('Order submitted successfully! Email has been sent to management.');
            
            // Reset form
            document.getElementById('orderForm').reset();
            
            // Set date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('orderDate').value = today;
            
            // Pre-fill employee name again
            if (window.currentUser) {
                const employeeNameInput = document.getElementById('employeeName');
                if (employeeNameInput) {
                    employeeNameInput.value = window.currentUser.displayName;
                }
                // Pre-fill store if user has one
                if (window.currentUser.store) {
                    document.getElementById('store').value = window.currentUser.store;
                }
            }
            
            // Clear dynamic items and add default ones
            document.getElementById('officeSupplies').innerHTML = '';
            document.getElementById('cleaningSupplies').innerHTML = '';
            addSupplyItem('officeSupplies');
            addSupplyItem('cleaningSupplies');
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
        // Reset loading state
        form.classList.remove('loading');
        submitBtn.textContent = 'Submit Order';
        submitBtn.disabled = false;
    }
}

// Save order to localStorage (for demonstration purposes)
function saveOrderToStorage(orderData) {
    const orders = JSON.parse(localStorage.getItem('supplyOrders') || '[]');
    const orderWithId = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...orderData
    };
    orders.push(orderWithId);
    localStorage.setItem('supplyOrders', JSON.stringify(orders));
}

// Show success message
function showSuccessMessage(message = 'Your supply order has been saved and will be processed soon.', type = 'success') {
    const successDiv = document.createElement('div');
    successDiv.className = `success-message ${type}`;
    
    const icon = type === 'error' ? '⚠️' : '✅';
    const title = type === 'error' ? 'Order Submission Issue' : 'Order Submitted Successfully!';
    
    successDiv.innerHTML = `
        <div class="success-content">
            <h3>${icon} ${title}</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="success-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 8 seconds for errors, 5 seconds for success
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, type === 'error' ? 8000 : 5000);
}

// Reset form for new order
function resetForm() {
    document.getElementById('orderForm').reset();
    document.getElementById('orderForm').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    
    // Reset to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Reset supply sections to have only one item each
    resetSupplySection('officeSupplies');
    resetSupplySection('cleaningSupplies');
    
    // Focus on employee name
    document.getElementById('employeeName').focus();
}

// Reset a supply section to have only one empty item
function resetSupplySection(sectionId) {
    const container = document.getElementById(sectionId);
    container.innerHTML = `
        <div class="supply-item">
            <div class="supply-inputs">
                <input type="text" placeholder="Item name" class="item-name">
                <input type="number" placeholder="Quantity" class="item-quantity" min="1">
                <button type="button" class="remove-item" onclick="removeSupplyItem(this)">Remove</button>
            </div>
        </div>
    `;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreview();
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modal
    if (event.key === 'Escape') {
        closePreview();
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const form = document.getElementById('orderForm');
        if (form.style.display !== 'none') {
            handleFormSubmit(event);
        }
    }
});

// Auto-save draft functionality (optional)
function saveDraft() {
    const formData = collectFormData();
    localStorage.setItem('orderDraft', JSON.stringify(formData));
}

// Load draft functionality (optional)
function loadDraft() {
    const draft = localStorage.getItem('orderDraft');
    if (draft) {
        const data = JSON.parse(draft);
        
        // Populate basic fields
        if (data.employeeName) document.getElementById('employeeName').value = data.employeeName;
        if (data.store) document.getElementById('store').value = data.store;
        if (data.orderDate) document.getElementById('orderDate').value = data.orderDate;
        if (data.notes) document.getElementById('notes').value = data.notes;
        
        // Populate supplies (implementation would be more complex)
        // This is a simplified version
        console.log('Draft loaded:', data);
    }
}

// Auto-save every 30 seconds
setInterval(saveDraft, 30000);

// Export order data as JSON (for debugging/admin purposes)
function exportOrderData() {
    const orders = JSON.parse(localStorage.getItem('supplyOrders') || '[]');
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'supply_orders.json';
    link.click();
}

// Console command to export data (for admin use)
console.log('To export all order data, run: exportOrderData()');