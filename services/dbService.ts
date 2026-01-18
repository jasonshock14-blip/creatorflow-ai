
export interface UserRecord {
  username: string;
  password: string;
  boundDeviceIds: string[];
  createdAt: number;
}

const DB_KEY = 'cf_mock_db_users_v2';

// Simple encoding helper
const encodePass = (p: string) => btoa(p);
const decodePass = (p: string) => {
  try { return atob(p); } catch { return p; }
};

/**
 * ==========================================================
 * MANUAL USER CONFIGURATION (CODING ENTRY)
 * ==========================================================
 * Add your usernames, passwords, and Device IDs here.
 * You can list as many devices as you want for one user.
 */
const HARDCODED_USERS: UserRecord[] = [
  {
    username: 'admin',
    password: '0000',
    boundDeviceIds: [], // Empty means first login auto-binds
    createdAt: Date.now()
  },
  {
    username: 'jason_pro',
    password: 'password123',
    // ADD YOUR MANUAL DEVICE IDs HERE:
    boundDeviceIds: [
      'HWID-A1B2C3D4', 
      'HWID-PHONEXYZ', 
      'HWID-TABLET123'
    ], 
    createdAt: Date.now()
  },
  {
    username: 'creator_team',
    password: 'secure-token-2025',
    boundDeviceIds: [
      'HWID-LAPTOP-01',
      'HWID-LAPTOP-02'
    ],
    createdAt: Date.now()
  }
];

export const getDB = (): UserRecord[] => {
  const data = localStorage.getItem(DB_KEY);
  let storedUsers: UserRecord[] = [];

  if (data) {
    try {
      const parsed = JSON.parse(data);
      storedUsers = parsed.map((u: any) => ({ 
        ...u, 
        password: decodePass(u.password) 
      }));
    } catch (e) {
      storedUsers = [];
    }
  }

  // Merge logic: Hardcoded users from code are merged with stored users.
  const merged = [...storedUsers];
  
  HARDCODED_USERS.forEach(hUser => {
    const existingIdx = merged.findIndex(u => u.username.toLowerCase() === hUser.username.toLowerCase());
    if (existingIdx === -1) {
      merged.push(hUser);
    } else {
      // Sync hardcoded devices with stored ones and ensure uniqueness
      const combinedDevices = Array.from(new Set([
        ...merged[existingIdx].boundDeviceIds, 
        ...hUser.boundDeviceIds
      ]));
      
      merged[existingIdx] = { 
        ...merged[existingIdx],
        password: hUser.password,
        boundDeviceIds: combinedDevices
      };
    }
  });

  return merged;
};

export const saveDB = (users: UserRecord[]): UserRecord[] => {
  const encodedUsers = users.map(u => ({ ...u, password: encodePass(u.password) }));
  localStorage.setItem(DB_KEY, JSON.stringify(encodedUsers));
  return users;
};

export const findUser = (username: string): UserRecord | undefined => {
  const users = getDB();
  return users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
};

export const addUser = (user: UserRecord): UserRecord[] | null => {
  const users = getDB();
  const normalizedUsername = user.username.trim();
  if (users.find(u => u.username.toLowerCase() === normalizedUsername.toLowerCase())) {
    return null;
  }
  const newList = [...users, { ...user, username: normalizedUsername }];
  return saveDB(newList);
};

export const deleteUser = (username: string): UserRecord[] => {
  const normalizedTarget = username.trim().toLowerCase();
  if (normalizedTarget === 'admin') {
    throw new Error("The master 'admin' account cannot be deleted.");
  }
  const users = getDB();
  const filtered = users.filter(u => u.username.toLowerCase() !== normalizedTarget);
  return saveDB(filtered);
};

export const updateDeviceBinding = (username: string, deviceIds: string[]): UserRecord[] => {
  const users = getDB();
  const normalizedTarget = username.trim().toLowerCase();
  const index = users.findIndex(u => u.username.toLowerCase() === normalizedTarget);
  if (index !== -1) {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], boundDeviceIds: deviceIds };
    return saveDB(updatedUsers);
  }
  return users;
};

export const updatePassword = (username: string, newPass: string): UserRecord[] => {
  const users = getDB();
  const normalizedTarget = username.trim().toLowerCase();
  const index = users.findIndex(u => u.username.toLowerCase() === normalizedTarget);
  if (index !== -1) {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], password: newPass };
    return saveDB(updatedUsers);
  }
  return users;
};
