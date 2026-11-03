/**
 * 🌸 Sakura Core Client Engine
 * Provides shared utilities: Auth, Theme, Toasts, Image Compression, Notifications
 */

// ── Auth Utilities ──
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    return {};
  }
}

function setUser(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
}

function authHeaders(extraHeaders = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    ...extraHeaders,
  };
}

function checkAuth(redirectIfNoAuth = true) {
  const token = getToken();
  if (!token && redirectIfNoAuth) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ── Theme Manager ──
function initTheme() {
  const savedTheme = localStorage.getItem('sakura_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sakura_theme', next);
  updateThemeIcon(next);
  showToast(`Switched to ${next === 'dark' ? 'Dark Blossom' : 'Light Blossom'} theme`, 'info');
}

function updateThemeIcon(theme) {
  const iconEls = document.querySelectorAll('.theme-icon-use');
  iconEls.forEach((el) => {
    el.setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
  });
}

// ── Toast Notifications ──
function showToast(message, type = 'info') {
  let container = document.getElementById('sakuraToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sakuraToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'i-aperture';
  if (type === 'success') iconName = 'i-check';
  if (type === 'error') iconName = 'i-alert';
  if (type === 'info') iconName = 'i-star';

  toast.innerHTML = `
    <svg class="ico ico-sm" style="stroke:currentColor"><use href="#${iconName}"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ── Image Compressor (Preserves Quality, Keeps Base64 fast & lightweight) ──
function compressImage(file, maxWidth = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith('image/')) return reject(new Error('Selected file is not an image'));

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Time Ago Formatter ──
function timeAgo(dateString) {
  if (!dateString) return 'just now';
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Falling Petals Generator ──
function createPetals(count = 7) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = 7 + Math.random() * 9 + 's';
    p.style.animationDelay = Math.random() * 8 + 's';
    document.body.appendChild(p);
  }
}

// ── Notifications System ──
let unreadNotifCount = 0;

async function fetchNotifications() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/notifications', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) return;

    const data = await res.json();
    renderNotifications(data.notifications || [], data.unreadCount || 0);
  } catch (err) {
    console.error('fetchNotifications:', err);
  }
}

function renderNotifications(notifications, unreadCount) {
  unreadNotifCount = unreadCount;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  const listEl = document.getElementById('notifList');
  if (!listEl) return;

  if (!notifications.length) {
    listEl.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">No notifications yet 🌸</div>';
    return;
  }

  listEl.innerHTML = notifications
    .map((n) => {
      const initials = n.sender?.fullName?.[0]?.toUpperCase() || 'U';
      const avatarHtml = n.sender?.profilePicture
        ? `<img src="${n.sender.profilePicture}" alt="${initials}">`
        : initials;

      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n._id}', '${n.sender?._id}')">
          <div class="notif-avatar">${avatarHtml}</div>
          <div class="notif-content">
            <b>${n.sender?.fullName || 'Someone'}</b> ${n.text || (n.type === 'like' ? 'liked your post' : n.type === 'comment' ? 'commented on your post' : 'started following you')}
            <div class="notif-time">${timeAgo(n.createdAt)}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function toggleNotifDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('notifDropdown');
  if (!dropdown) return;
  dropdown.classList.toggle('open');
  if (dropdown.classList.contains('open')) {
    fetchNotifications();
  }
}

async function markAllNotificationsRead() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token },
    });
    if (res.ok) {
      unreadNotifCount = 0;
      const badge = document.getElementById('notifBadge');
      if (badge) badge.style.display = 'none';
      const unreadItems = document.querySelectorAll('.notif-item.unread');
      unreadItems.forEach((el) => el.classList.remove('unread'));
      showToast('All notifications marked as read', 'success');
    }
  } catch (e) {}
}

async function handleNotifClick(notifId, senderId) {
  const token = getToken();
  try {
    await fetch(`/api/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token },
    });
  } catch (e) {}

  if (senderId) {
    window.location.href = `user-profile.html?id=${senderId}`;
  }
}

// ── Mobile Search Toggle ──
function toggleMobileSearch() {
  const navCenter = document.querySelector('.nav-center');
  if (navCenter) {
    navCenter.classList.toggle('mobile-active');
    const input = navCenter.querySelector('input');
    if (navCenter.classList.contains('mobile-active') && input) {
      input.focus();
    }
  }
}

// ── Global click listener to close dropdowns ──
document.addEventListener('click', (e) => {
  const notifDropdown = document.getElementById('notifDropdown');
  if (notifDropdown && !e.target.closest('#notifBtn') && !e.target.closest('#notifDropdown')) {
    notifDropdown.classList.remove('open');
  }

  const searchDropdown = document.getElementById('searchDropdown');
  if (searchDropdown && !e.target.closest('.nav-search-wrap')) {
    searchDropdown.classList.remove('open');
  }
});

// Auto-run theme initializer on script load
initTheme();
