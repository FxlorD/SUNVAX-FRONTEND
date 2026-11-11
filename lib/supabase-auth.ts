'use client';

const SESSION_KEY = 'sunvax-supabase-session';
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type AuthUser = { id: string; email?: string; user_metadata?: { full_name?: string; organization?: string } };
type Session = { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number; user: AuthUser };

function config() {
  if (!projectUrl || !anonKey || projectUrl.includes('your-project-ref')) throw new Error('Supabase is not configured. Add the project URL and anon key to .env.local and Vercel.');
  return { projectUrl, anonKey };
}
function saveSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({...session,expires_at:session.expires_at??(session.expires_in?Math.floor(Date.now()/1000)+session.expires_in:undefined)}));
  else localStorage.removeItem(SESSION_KEY);
}
async function authRequest<T>(path: string, body: unknown, token?: string): Promise<T> {
  const { projectUrl, anonKey } = config();
  const response = await fetch(`${projectUrl}/auth/v1/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: anonKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || data.error || 'Supabase authentication failed.');
  return data as T;
}
export async function signUp(email: string, password: string, name: string, organization: string) {
  const result = await authRequest<Session & { access_token?: string }>('signup', { email, password, data: { full_name: name, organization } });
  if (result.access_token) saveSession(result as Session);
  return result;
}
export async function signIn(email: string, password: string) {
  const session = await authRequest<Session>('token?grant_type=password', { email, password });
  saveSession(session);
  return session.user;
}
export async function currentUser(): Promise<AuthUser | null> {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  let session: Session;
  try { session = JSON.parse(raw) as Session; } catch { saveSession(null); return null; }
  try {
    if (session.expires_at && session.expires_at < Date.now() / 1000 + 30) {
      const renewed = await authRequest<Session>('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
      session = renewed; saveSession(session);
    }
    const { projectUrl, anonKey } = config();
    const response = await fetch(`${projectUrl}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) { saveSession(null); return null; }
    return await response.json() as AuthUser;
  } catch { saveSession(null); return null; }
}
export async function signOut() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const session = JSON.parse(raw) as Session;
    await authRequest('logout', {}, session.access_token);
  } finally { saveSession(null); }
}
