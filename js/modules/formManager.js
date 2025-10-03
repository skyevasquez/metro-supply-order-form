/**
 * Form management module for the supply order system
 */

/**
 * Add a new supply item to the specified section
 * @param {string} sectionId - ID of the section container
 */
export function addSupplyItem(sectionId) {
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

/**
 * Remove a supply item
 * @param {HTMLElement} button - Remove button element
 */
export function removeSupplyItem(button) {
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

/**
 * Collect all form data
 * @returns {Object} Form data object
 */
export function collectFormData() {
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

/**
 * Validate form data
 * @param {Object} data - Form data object
 * @returns {boolean} True if valid
 */
export function validateFormData(data) {
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

/**
 * Reset form for new order
 */
export function resetForm() {
    const form = document.getElementById('orderForm');
    form.reset();

    // Reset to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;

    // Reset supply sections to have only one item each
    resetSupplySection('officeSupplies');
    resetSupplySection('cleaningSupplies');

    // Focus on employee name
    document.getElementById('employeeName').focus();
}

/**
 * Reset a supply section to have only one empty item
 * @param {string} sectionId - ID of the section
 */
export function resetSupplySection(sectionId) {
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

/**
 * Set today's date as default
 */
export function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
}