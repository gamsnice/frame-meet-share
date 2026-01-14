// Centralized auth configuration
// Update siteUrl when you have your custom domain configured

export const AUTH_CONFIG = {
  // Custom domain - CHANGE THIS to your actual custom domain
  siteUrl: 'https://meetme.vasy.dev',
  
  // Redirect paths after auth actions
  redirects: {
    afterLogin: '/admin',
    afterSignup: '/admin',
    afterPasswordReset: '/admin/login',
    passwordResetPage: '/admin/reset-password',
  },
  
  // Password requirements
  passwordMinLength: 8,
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },
  
  // For future: OAuth providers (add 'google' when ready)
  enabledProviders: ['email'] as const,
};

// Helper to construct full redirect URLs
export const getRedirectUrl = (path: string): string => {
  return `${AUTH_CONFIG.siteUrl}${path}`;
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { passwordRequirements } = AUTH_CONFIG;
  
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`);
  }
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (passwordRequirements.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return { valid: errors.length === 0, errors };
};

// Password strength indicator
export const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};
