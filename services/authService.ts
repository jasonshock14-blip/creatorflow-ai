
import { getDeviceId } from './deviceService';
import { findUser, updateDeviceBinding, UserRecord } from './dbService';

export interface AuthSession {
  username: string;
  deviceId: string;
}

export const loginUser = (username: string, pass: string): { success: boolean; message: string; session?: AuthSession } => {
  const currentDevice = getDeviceId();
  
  // 1. Check if user exists (case-insensitive)
  const user = findUser(username);
  if (!user) {
    return { success: false, message: 'Identity not found in database.' };
  }

  // 2. Check password
  if (user.password !== pass) {
    return { success: false, message: 'Invalid access token.' };
  }

  // 3. Check Device Binding
  if (user.boundDeviceId && user.boundDeviceId !== currentDevice) {
    return { 
      success: false, 
      message: 'Security Alert: This account is locked to a different device.' 
    };
  }

  // 4. Bind device if first login
  if (!user.boundDeviceId) {
    updateDeviceBinding(user.username, currentDevice);
  }

  // 5. Create session (Always use the canonical username from DB)
  const session = { username: user.username, deviceId: currentDevice };
  sessionStorage.setItem('cf_active_session', JSON.stringify(session));

  return { success: true, message: 'Identity verified.', session };
};

export const getActiveSession = (): AuthSession | null => {
  const session = sessionStorage.getItem('cf_active_session');
  return session ? JSON.parse(session) : null;
};

export const logoutUser = () => {
  sessionStorage.removeItem('cf_active_session');
};
