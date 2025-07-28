const passwordPolicy = (password) => {
    // Define your password rules
    const minLength = 12;
    const maxLength = 64;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Check if all conditions are met
    if (password.length < minLength || password.length > maxLength) {
        return { valid: false, message: `Password must be between ${minLength} and ${maxLength} characters.` };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasNumber) {
        return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain at least one special character.' };
    }

    return { valid: true, message: 'Password meets all requirements.' };
};

module.exports = passwordPolicy;