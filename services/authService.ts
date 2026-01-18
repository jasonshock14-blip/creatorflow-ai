
import { User, AuthSession } from '../types';

const USERS_KEY = 'creatorflow_users';
const SESSION_KEY = 'creatorflow_session';
const DEVICE_ID_KEY = 'creatorflow_device_identity';

/**
 * ============================================================
 * STEP-BY-STEP: HOW TO ADD USERS & AUTHORIZE DEVICES
 * ============================================================
 * 
 * 1. GET YOUR DEVICE ID:
 *    - Open your app in the browser.
 *    - On the login page, find the "Device Identity" box.
 *    - Click the Copy icon (it looks like "A1B2-C3D4-ID").
 * 
 * 2. EDIT THIS FILE:
 *    - Open 'services/authService.ts' in your code editor.
 * 
 * 3. ADD A USER ENTRY:
 *    - Look at the AUTHORIZED_USERS array below.
 *    - Add a new block for yourself:
 *      { 
 *        username: "my_name", 
 *        passwordHash: "my_password", 
 *        deviceIds: ["PASTE-YOUR-COPIED-ID-HERE"] 
 *      }
 * 
 * 4. UPLOAD TO GITHUB:
 *    - Save this file and push it to your GitHub repository.
 *    - Once the "Deploy" action finishes, you can log in!
 * ============================================================
 */
const AUTHORIZED_USERS: User[] = [
  {
    username: "admin",
    passwordHash: "0000",
    deviceIds: ["1D94-B37F-ID", "DEV-SAMPLE-ID-2"] 
  },
  {
    username: "creator_pro",
    passwordHash: "securePass2025",
    deviceIds: ["PASTE_YOUR_DEVICE_ID_HERE"]
  },
  // ADD YOUR NEW USER HERE:
  {
    username: "user1",
    passwordHash: "1234",
    deviceIds: ["7F2A-C91B-ID"] // Replace with your real Device ID
  }
];

/**
 * Generates a stable "fingerprint" of the browser.
 * It uses hardware and software signatures so the ID stays the 
 * same even if you reload or clear browser history.
 */
const generateFingerprint = (): string => {
  const parts = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    (navigator as any).hardwareConcurrency || '8',
    'creatorflow-v2-stable' // Salt to keep IDs specific to this app
  ];
  
  const str = parts.join('|');
  
  // Hash function to turn the long browser string into a short ID
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  // Returns a professional looking hardware-style ID
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-ID`;
};

export const getCurrentDeviceId = (): string => {
  // We prioritize the generated fingerprint to ensure it never changes
  const fingerprint = generateFingerprint();
  
  // We still save it to localStorage for performance, but the 
  // fingerprinting logic ensures it's consistent across reloads.
  localStorage.setItem(DEVICE_ID_KEY, fingerprint);
  
  return fingerprint;
};

/**
 * Merges hardcoded code-based users with locally registered users
 */
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

export const saveUser = (user: User) => {
  const localData = localStorage.getItem(USERS_KEY);
  const localUsers: User[] = localData ? JSON.parse(localData) : [];
  const localIndex = localUsers.findIndex(u => u.username === user.username);
  
  if (localIndex > -1) {
    localUsers[localIndex] = user;
  } else {
    localUsers.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));
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
      error: `Device not authorized. Your current ID is: ${currentDeviceId}. Add this ID to the "AUTHORIZED_USERS" list in services/authService.ts.` 
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
  const newUser: User = {
    username,
    passwordHash: password,
    deviceIds: [currentDeviceId]
  };
  saveUser(newUser);
  return { success: true };
};

export const addDeviceIdToUser = (username: string, newDeviceId: string) => {
  const users = getStoredUsers();
  const user = users.find(u => u.username === username);
  if (user && !user.deviceIds.includes(newDeviceId)) {
    const updatedUser = { ...user, deviceIds: [...user.deviceIds, newDeviceId] };
    saveUser(updatedUser);
  }
};
