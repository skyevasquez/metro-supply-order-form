/**
 * Validation middleware for the supply order system
 */

/**
 * Validate order submission data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validateOrderSubmission(req, res, next) {
    const {
        employeeName,
        store,
        orderDate,
        officeSupplies,
        cleaningSupplies,
        additionalNotes
    } = req.body;

    const errors = [];

    // Validate required fields
    if (!employeeName || typeof employeeName !== 'string' || employeeName.trim().length === 0) {
        errors.push('Employee name is required and must be a non-empty string');
    }

    if (!store || typeof store !== 'string' || store.trim().length === 0) {
        errors.push('Store selection is required');
    }

    if (!orderDate || typeof orderDate !== 'string') {
        errors.push('Order date is required');
    } else {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(orderDate)) {
            errors.push('Order date must be in YYYY-MM-DD format');
        } else {
            const orderDateObj = new Date(orderDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (orderDateObj < today) {
                errors.push('Order date cannot be in the past');
            }
        }
    }

    // Validate supplies arrays
    const supplies = [...(officeSupplies || []), ...(cleaningSupplies || [])];
    const validSupplies = supplies.filter(item =>
        item &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0 &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        Number.isInteger(item.quantity)
    );

    if (validSupplies.length === 0) {
        errors.push('At least one valid supply item with name and quantity is required');
    }

    // Validate additional notes if provided
    if (additionalNotes && typeof additionalNotes !== 'string') {
        errors.push('Additional notes must be a string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors,
            timestamp: new Date().toISOString()
        });
    }

    // Sanitize and clean data
    req.body = {
        employeeName: employeeName.trim(),
        store: store.trim(),
        orderDate: orderDate.trim(),
        officeSupplies: (officeSupplies || []).filter(item =>
            item &&
            typeof item.name === 'string' &&
            item.name.trim().length > 0 &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        ),
        cleaningSupplies: (cleaningSupplies || []).filter(item =>
            item &&
            typeof item.name === 'string' &&
            item.name.trim().length > 0 &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        ),
        additionalNotes: additionalNotes ? additionalNotes.trim() : ''
    };

    next();
}

/**
 * Health check validator (always passes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validateHealthCheck(req, res, next) {
    // Health check doesn't require validation
    next();
}