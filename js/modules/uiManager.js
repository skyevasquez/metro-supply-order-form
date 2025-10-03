/**
 * UI management module for the supply order system
 */

/**
 * Format date for display
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Generate preview content HTML
 * @param {Object} data - Form data
 * @returns {string} HTML content
 */
export function generatePreviewContent(data) {
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

/**
 * Show success message
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
export function showSuccessMessage(message = 'Your supply order has been saved and will be processed soon.', type = 'success') {
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

/**
 * Set loading state on form
 * @param {boolean} loading - Whether to show loading state
 */
export function setFormLoading(loading) {
    const form = document.getElementById('orderForm');
    const submitBtn = document.querySelector('.submit-btn');

    if (loading) {
        form.classList.add('loading');
        submitBtn.textContent = 'Sending Order...';
        submitBtn.disabled = true;
    } else {
        form.classList.remove('loading');
        submitBtn.textContent = 'Submit Order';
        submitBtn.disabled = false;
    }
}

/**
 * Show order preview
 * @param {Object} formData - Form data
 */
export function showOrderPreview(formData) {
    const previewContent = generatePreviewContent(formData);
    document.getElementById('previewContent').innerHTML = previewContent;
    document.getElementById('previewModal').style.display = 'block';
}

/**
 * Close order preview modal
 */
export function closeOrderPreview() {
    document.getElementById('previewModal').style.display = 'none';
}

/**
 * Setup modal click outside handler
 */
export function setupModalHandlers() {
    // Close modal when clicking outside of it
    window.onclick = function (event) {
        const modal = document.getElementById('previewModal');
        if (event.target === modal) {
            closeOrderPreview();
        }
    };

    // Add keyboard shortcuts
    document.addEventListener('keydown', function (event) {
        // Escape key to close modal
        if (event.key === 'Escape') {
            closeOrderPreview();
        }

        // Ctrl/Cmd + Enter to submit form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            const form = document.getElementById('orderForm');
            if (form.style.display !== 'none') {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
}