/**
 * Authentication module for the supply order system
 */

let currentUser = null;

/**
 * Check if user is authenticated
 * @returns {Promise<Object|null>} User object or null
 */
export async function checkAuthStatus() {
    try {
        const { onAuthChange } = await import('../src/firebase/auth.js');

        return new Promise((resolve) => {
            onAuthChange(({ user, profile }) => {
                if (!user) {
                    // Not authenticated, redirect to login
                    window.location.href = '/auth.html';
                    resolve(null);
                } else {
                    // Authenticated, store user info globally
                    currentUser = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || profile?.displayName || 'User',
                        store: profile?.store || '',
                        phoneNumber: profile?.phoneNumber || '',
                        role: profile?.role || 'employee'
                    };

                    resolve(currentUser);
                }
            });
        });
    } catch (error) {
        console.error('Failed to load Firebase auth:', error);
        // If Firebase fails to load, continue anyway (fallback to no auth)
        return null;
    }
}

/**
 * Get current user
 * @returns {Object|null} Current user object
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Set current user
 * @param {Object} user - User object
 */
export function setCurrentUser(user) {
    currentUser = user;
}

/**
 * Show user info in header
 * @param {Object} user - User object
 */
export function showUserInfo(user) {
    const headerMeta = document.querySelector('.header-meta');
    if (headerMeta) {
        headerMeta.innerHTML = `
            <span style="margin-right: 15px;">👤 ${user.displayName}</span>
            <button onclick="handleSignOut()" style="padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 6px; cursor: pointer; font-size: 14px;">Sign Out</button>
        `;
    }
}

/**
 * Handle sign out
 */
export async function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            const { signOutUser } = await import('../src/firebase/auth.js');
            await signOutUser();
            window.location.href = '/auth.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Failed to sign out. Please try again.');
        }
    }
}

/**
 * Pre-fill form fields with user data
 * @param {Object} user - User object
 */
export function preFillFormWithUserData(user) {
    if (!user) return;

    // Pre-fill store field if user has assigned store
    if (user.store) {
        const storeSelect = document.getElementById('store');
        if (storeSelect) {
            storeSelect.value = user.store;
        }
    }

    // Pre-fill employee name
    const employeeNameInput = document.getElementById('employeeName');
    if (employeeNameInput && !employeeNameInput.value) {
        employeeNameInput.value = user.displayName;
    }
}