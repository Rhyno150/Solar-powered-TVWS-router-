import React, { useState, useEffect } from 'react';
import { BackIcon, UserIcon, UsersIcon } from '../icons';
import type { InstallationLog, RegisteredUser } from '../types';

// Mock data for registered users. In a real app, this would come from an API.
const MOCK_USERS: RegisteredUser[] = [
    { id: 'u1', name: 'Columbus Public Library', contact: 'main@columbuslibrary.org', unitId: 'TW-5F9C1A', registeredAt: '2024-06-16T10:00:00Z' },
    { id: 'u2', name: 'Franklin County EMA', contact: 'dispatch@franklincountyoh.gov', unitId: 'TW-8B2E4D', registeredAt: '2024-07-23T11:00:00Z' },
    { id: 'u3', name: 'Toledo Fire Dept #3', contact: 'station3@toledo.oh.gov', unitId: 'TW-1C7F0B', registeredAt: '2024-05-02T12:00:00Z' },
];

const AccessManagement: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [installationLogs, setInstallationLogs] = useState<InstallationLog[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserContact, setNewUserContact] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/installation_logs.json')
      .then(res => res.json())
      .then((data: InstallationLog[]) => {
        setInstallationLogs(data);
        if (data.length > 0) {
          setSelectedUnitId(data[0].unitId);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Filter mock users based on the selected unit
    setRegisteredUsers(MOCK_USERS.filter(user => user.unitId === selectedUnitId));
  }, [selectedUnitId]);

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserContact) {
        setStatusMessage("User's Name and Contact are required.");
        return;
    }
    const newUser: RegisteredUser = {
        id: `u${Date.now()}`,
        name: newUserName,
        contact: newUserContact,
        unitId: selectedUnitId,
        registeredAt: new Date().toISOString()
    };
    // In a real app, you would send this to the server.
    // Here, we just add it to our mock state.
    setRegisteredUsers(prev => [...prev, newUser]);
    setNewUserName('');
    setNewUserContact('');
    setStatusMessage(`User "${newUserName}" registered successfully to unit ${selectedUnitId}.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back to Dashboard</span>
      </button>

      <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Community Access Management</h2>
        
        <div>
            <label htmlFor="unit-select" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Select Installation Unit</label>
            <select
                id="unit-select"
                value={selectedUnitId}
                onChange={e => setSelectedUnitId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-accent-orange focus:border-accent-orange sm:text-sm rounded-md"
            >
                {isLoading ? (
                    <option>Loading units...</option>
                ) : (
                    installationLogs.map(log => <option key={log.unitId} value={log.unitId}>{log.unitId}</option>)
                )}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registered Users List */}
        <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><UsersIcon className="w-6 h-6 mr-2 text-accent-orange"/> Registered Users</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {registeredUsers.length > 0 ? registeredUsers.map(user => (
                    <div key={user.id} className="p-3 bg-theme-white dark:bg-theme-dark rounded-lg">
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{user.contact}</p>
                        <p className="text-xs text-gray-400">Registered: {new Date(user.registeredAt).toLocaleDateString()}</p>
                    </div>
                )) : (
                    <p className="text-center text-text-light-secondary dark:text-text-dark-secondary p-4">No users registered for this unit.</p>
                )}
            </div>
        </div>

        {/* New User Form */}
        <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><UserIcon className="w-6 h-6 mr-2 text-accent-orange"/> Register New User</h3>
            <form onSubmit={handleRegisterUser} className="space-y-4">
                <div>
                    <label htmlFor="user-name" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">User's Name</label>
                    <input type="text" id="user-name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-orange focus:border-accent-orange" placeholder="e.g., Main Street Clinic"/>
                </div>
                <div>
                    <label htmlFor="user-contact" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Contact (Email/Phone)</label>
                    <input type="text" id="user-contact" value={newUserContact} onChange={e => setNewUserContact(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-orange focus:border-accent-orange" placeholder="contact@example.com"/>
                </div>
                 {statusMessage && <p className="text-center text-sm font-semibold text-accent-orange-dark">{statusMessage}</p>}
                <button type="submit" disabled={!selectedUnitId} className="w-full py-2 px-4 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange-dark disabled:bg-gray-400 transition-colors">
                    Register User
                </button>
            </form>
        </div>

      </div>
    </div>
  );
};

export default AccessManagement;
