
import { getDeviceId } from './deviceService.ts';
import { findUser, updateDeviceBinding, UserRecord } from './dbService.ts';

export interface AuthSession {
  username: string;
  deviceId: string;
}

export const loginUser = (username: string, pass: string): { success: boolean; message: string; session?: AuthSession } => {
  const currentDevice = getDeviceId();
  
  const user = findUser(username);
  if (!user) {
    return { success: false, message: 'Identity not found in database.' };
  }

  if (user.password !== pass) {
    return { success: false, message: 'Invalid access token.' };
  }

  // Multi-Device Check
  if (user.boundDeviceIds && user.boundDeviceIds.length > 0 && !user.boundDeviceIds.includes(currentDevice)) {
    return { 
      success: false, 
      message: `Security Alert: This device (${currentDevice}) is not authorized for this account.` 
    };
  }

  // Auto-bind if list is empty
  if (!user.boundDeviceIds || user.boundDeviceIds.length === 0) {
    updateDeviceBinding(user.username, [currentDevice]);
  }

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
