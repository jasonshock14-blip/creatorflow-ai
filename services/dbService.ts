
export interface UserRecord {
  username: string;
  password: string;
  boundDeviceId: string | null;
  createdAt: number;
}

const DB_KEY = 'cf_mock_db_users';

// Simple encoding helper to prevent plain-text visibility in LocalStorage
const encodePass = (p: string) => btoa(p);
const decodePass = (p: string) => {
  try { return atob(p); } catch { return p; }
};

export const getDB = (): UserRecord[] => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const defaultAdmin: UserRecord = {
      username: 'admin',
      password: encodePass('0000'),
      boundDeviceId: null,
      createdAt: Date.now()
    };
    const initialDB = [defaultAdmin];
    localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    return initialDB;
  }
  try {
    const users: UserRecord[] = JSON.parse(data);
    return users.map(u => ({ ...u, password: decodePass(u.password) }));
  } catch (e) {
    return [];
  }
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
  // Protected account
  if (normalizedTarget === 'admin') {
    throw new Error("The master 'admin' account cannot be deleted.");
  }
  
  const users = getDB();
  const filtered = users.filter(u => u.username.toLowerCase() !== normalizedTarget);
  return saveDB(filtered);
};

export const updateDeviceBinding = (username: string, deviceId: string | null): UserRecord[] => {
  const users = getDB();
  const normalizedTarget = username.trim().toLowerCase();
  const index = users.findIndex(u => u.username.toLowerCase() === normalizedTarget);
  if (index !== -1) {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], boundDeviceId: deviceId };
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
