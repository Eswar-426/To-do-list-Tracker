// THEME
(function initTheme(){
  const key = 'focusflow.theme';
  const apply = t => {
    document.body.classList.remove('light','dark','amoled');
    document.body.classList.add(t || 'light');
    localStorage.setItem(key, t || 'light');
  };
  apply(localStorage.getItem(key) || 'light');
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = document.body.classList.contains('light') ? '🌙'
                    : document.body.classList.contains('dark') ? '💡' : '☀️';
    btn.addEventListener('click', () => {
      const cur = document.body.classList.contains('light') ? 'light' :
                  document.body.classList.contains('dark') ? 'dark' : 'amoled';
      const next = cur==='light' ? 'dark' : (cur==='dark' ? 'amoled' : 'light');
      apply(next);
      btn.textContent = next==='light' ? '🌙' : (next==='dark' ? '💡' : '☀️');
    });
  }
})();

// STORAGE KEYS
const USER_LIST_KEY  = 'focusflow.auth.users';     // [{name,email,hpw,createdAt}]
const TOKEN_KEY      = 'focusflow.auth.token';     // session token
const LAST_EMAIL_KEY = 'focusflow.auth.lastEmail';

// HELPERS
const safeJSON = {
  // Important: if s is null/empty, return fallback immediately.
  parse: (s, fb) => {
    if (s == null || s === '') return fb;
    try { 
      const v = JSON.parse(s);
      // If parse returns null/undefined, still fallback to keep types stable
      return (v === null || v === undefined) ? fb : v;
    } catch { 
      return fb; 
    }
  }
};

// Secure-when-possible; demo-fallback otherwise
async function sha256(str){
  try {
    if (window.crypto && crypto.subtle && location.protocol !== 'http:') {
      const buf = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
  } catch {}
  // Fallback: fast non-crypto demo hash (NOT for production)
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i=0;i<str.length;i++){ h1 ^= str.charCodeAt(i); h1 = (h1 * 16777619) >>> 0; h2 = (h2 ^ h1) >>> 0; }
  return (h1.toString(16).padStart(8,'0') + h2.toString(16).padStart(8,'0')).repeat(4).slice(0,64);
}

// Ensure users array exists once (prevents null on first run)
if (!localStorage.getItem(USER_LIST_KEY)) {
  localStorage.setItem(USER_LIST_KEY, '[]');
}

const Users = {
  all(){
    const list = safeJSON.parse(localStorage.getItem(USER_LIST_KEY), []);
    return Array.isArray(list) ? list : []; // hard guarantee: always array
  },
  get(email){
    const e = (email || '').toLowerCase();
    const list = this.all();
    return list.find(u => u.email === e);
  },
  add(u){
    const list = this.all();
    list.push(u);
    localStorage.setItem(USER_LIST_KEY, JSON.stringify(list));
  }
};

const Session = {
  set(remember){
    const token = Math.random().toString(36).slice(2) + '.' + Date.now().toString(36);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    if (!remember) localStorage.removeItem(TOKEN_KEY);
    return token;
  },
  clear(){ sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); },
  isAuthed(){ return !!(localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)); }
};

// Expose
window.FocusAuth = { Users, Session, sha256, LAST_EMAIL_KEY };
