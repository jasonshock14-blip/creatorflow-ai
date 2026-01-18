
import { User, AuthSession } from '../types';

const USERS_KEY = 'creatorflow_users';
const SESSION_KEY = 'creatorflow_session';
const DEVICE_ID_KEY = 'creatorflow_device_identity';

/**
 * ============================================================
 * AUTHORIZED USERS LIST
 * ============================================================
 * Add your username and Device ID here to log in.
 */
const AUTHORIZED_USERS: User[] = [
  {
    username: "admin",
    passwordHash: "0000",
    deviceIds: ["1D94-B37F-ID", "4A4C-7960-ID"] // Replace with your real ID from the login screen
  },
  {
    username: "user1",
    passwordHash: "1234",
    deviceIds: ["7F2A-C91B-ID"] 
  }
];

/**
 * Generates a stable hardware-style fingerprint of the browser.
 */
const generateFingerprint = (): string => {
  const parts = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    (navigator as any).hardwareConcurrency || '8',
    'creatorflow-v3-stable'
  ];
  const str = parts.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-ID`;
};

export const getCurrentDeviceId = (): string => {
  const fingerprint = generateFingerprint();
  localStorage.setItem(DEVICE_ID_KEY, fingerprint);
  return fingerprint;
};

export const getStoredUsers = (): User[] => {
  const localData = localStorage.getItem(USERS_KEY);
  const localUsers: User[] = localData ? JSON.parse(localData) : [];
  const combined = [...AUTHORIZED_USERS];
  localUsers.forEach(lu => {
    if (!combined.find(cu => cu.username === lu.username)) {
      combined.push(lu);
    }
  });
  return combined;
};

export const login = (username: string, password: string): { success: boolean; error?: string } => {
  const users = getStoredUsers();
  const user = users.find(u => u.username === username);
  const currentDeviceId = getCurrentDeviceId();

  if (!user) return { success: false, error: 'User not found' };
  if (user.passwordHash !== password) return { success: false, error: 'Incorrect password' };
  
  if (!user.deviceIds.includes(currentDeviceId)) {
    return { 
      success: false, 
      error: `Device not authorized. ID: ${currentDeviceId}. Add this ID to AUTHORIZED_USERS in services/authService.ts.` 
    };
  }

  const session: AuthSession = { username, deviceId: currentDeviceId };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true };
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getActiveSession = (): AuthSession | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const registerUser = (username: string, password: string): { success: boolean; error?: string } => {
  const users = getStoredUsers();
  if (users.find(u => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }
  const currentDeviceId = getCurrentDeviceId();
  const newUser: User = { username, passwordHash: password, deviceIds: [currentDeviceId] };
  const localData = localStorage.getItem(USERS_KEY);
  const localUsers: User[] = localData ? JSON.parse(localData) : [];
  localUsers.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));
  return { success: true };
};

export const addDeviceIdToUser = (username: string, newDeviceId: string) => {
  const users = getStoredUsers();
  const user = users.find(u => u.username === username);
  if (user && !user.deviceIds.includes(newDeviceId)) {
    const updatedUser = { ...user, deviceIds: [...user.deviceIds, newDeviceId] };
    const localData = localStorage.getItem(USERS_KEY);
    const localUsers: User[] = localData ? JSON.parse(localData) : [];
    const idx = localUsers.findIndex(u => u.username === username);
    if (idx > -1) localUsers[idx] = updatedUser; else localUsers.push(updatedUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));
  }
};
