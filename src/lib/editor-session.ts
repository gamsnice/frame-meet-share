// Keys for sessionStorage
const EDITOR_STATE_KEY = "meetme_editor_state";

interface EditorState {
  templateId: string;
  userImage: string; // base64 data URL
  timestamp: number;
}

export function saveEditorState(templateId: string, userImage: string): void {
  const state: EditorState = {
    templateId,
    userImage,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state));
}

export function getEditorState(): EditorState | null {
  const stored = sessionStorage.getItem(EDITOR_STATE_KEY);
  if (!stored) return null;

  try {
    const state: EditorState = JSON.parse(stored);
    // Expire after 10 minutes
    if (Date.now() - state.timestamp > 10 * 60 * 1000) {
      clearEditorState();
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearEditorState(): void {
  sessionStorage.removeItem(EDITOR_STATE_KEY);
}
