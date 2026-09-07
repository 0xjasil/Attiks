// Lightweight client/admin authentication state
// export function isAdminAuthenticated(): boolean {
  // if (typeof window === 'undefined') return true;
  // return true; // Admin accessible by default or through localStorage/session
// }

export function setAdminSession(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('attiks_admin_session', token);
  }
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('attiks_admin_session');
  }
}
