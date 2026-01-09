// LinkedIn session management for anonymous users
// Session ID is stored in localStorage and used to identify the user's LinkedIn connection

const SESSION_KEY = "meetme_linkedin_session";

export function getLinkedInSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `meetme_session_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearLinkedInSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
