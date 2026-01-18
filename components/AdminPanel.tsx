
import React, { useState, useEffect } from 'react';
import { getDB, addUser, deleteUser, updateDeviceBinding, updatePassword, UserRecord } from '../services/dbService';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPassValue, setEditPassValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshData = () => {
    setUsers([...getDB()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = newUsername.trim();
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    const updatedList = addUser({
      username: cleanUsername,
      password: newPassword || '1234',
      boundDeviceId: null,
      createdAt: Date.now()
    });

    if (updatedList) {
      setUsers([...updatedList]);
      setNewUsername('');
      setNewPassword('');
      showSuccess(`Account "${cleanUsername}" created.`);
    } else {
      setError('This username is already taken.');
    }
  };

  const handleDelete = (username: string) => {
    setError(null);
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE "${username}"?`)) {
      try {
        const updatedList = deleteUser(username);
        setUsers([...updatedList]);
        showSuccess(`User "${username}" removed.`);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleResetDevice = (username: string) => {
    if (window.confirm(`Clear hardware binding for "${username}"?`)) {
      const updatedList = updateDeviceBinding(username, null);
      setUsers([...updatedList]);
      showSuccess(`Device lock released for ${username}.`);
    }
  };

  const handleStartEdit = (user: UserRecord) => {
    setEditingUser(user.username);
    setEditPassValue(user.password);
  };

  const handleSavePassword = (username: string) => {
    const updatedList = updatePassword(username, editPassValue);
    setUsers([...updatedList]);
    setEditingUser(null);
    showSuccess(`Access token updated.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-indigo-400">Security Backend</h2>
          <p className="text-slate-400">Manage digital fingerprints and access tokens for your studio.</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl space-y-4 shadow-xl border border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Register New Seat
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. video_pro"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Access Token</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>
              {error && <p className="text-xs text-red-400 font-medium animate-in shake duration-300">{error}</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/10 active:scale-95 text-white"
              >
                Provision User
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Identity</th>
                    <th className="px-6 py-4 font-bold">Password</th>
                    <th className="px-6 py-4 font-bold">Hardware ID</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.username} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-indigo-300">{user.username}</span>
                        {user.username.toLowerCase() === 'admin' && (
                          <span className="ml-2 text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-black">Protected</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.username ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              className="bg-slate-800 border border-indigo-500/50 rounded px-2 py-1 text-xs outline-none text-white w-24"
                              value={editPassValue}
                              onChange={(e) => setEditPassValue(e.target.value)}
                              autoFocus
                            />
                            <button onClick={() => handleSavePassword(user.username)} className="text-emerald-400 hover:text-emerald-300">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-xs">{user.password}</span>
                            <button onClick={() => handleStartEdit(user)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-indigo-400 transition-all p-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.boundDeviceId ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Locked</span>
                            </div>
                            <code className="text-[9px] text-slate-600 truncate max-w-[90px] mt-1 opacity-60 font-mono">{user.boundDeviceId}</code>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-700 uppercase font-bold tracking-widest">Available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {user.boundDeviceId && (
                            <button onClick={() => handleResetDevice(user.username)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors px-2 py-1 rounded hover:bg-indigo-500/10">
                              Unbind
                            </button>
                          )}
                          {user.username.toLowerCase() !== 'admin' && (
                            <button onClick={() => handleDelete(user.username)} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase transition-colors px-2 py-1 rounded hover:bg-red-500/10">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 px-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[10px] text-slate-500 font-medium italic">Passwords are encoded in LocalStorage for basic privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
