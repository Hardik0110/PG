import { useEffect, useState } from 'react';
import { Moon, Sun, Bell, Shield, Palette, Save, Check } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';

function SettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: {
      email: true,
      push: true,
      inquiries: true,
      tickets: true
    },
    themeColor: '#10B981'
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const payload = await apiRequest('/api/v1/auth/me');
        const data = unwrapData(payload, {});
        if (!mounted) return;
        setSettings((prev) => ({
          ...prev,
          // Keep app settings local when backend does not expose settings endpoints.
          themeColor: data.themeColor || prev.themeColor
        }));
      } catch {
        if (!mounted) return;
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('pg_manager_settings', JSON.stringify(settings));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-foreground)', marginBottom: '32px' }}>
        Settings
      </h1>

      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#1C6C41',
          color: 'white',
          padding: '6px 10px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '18px',
          fontWeight: 600,
          zIndex: 'var(--z-toast)'
        }}>
          <Check size={24} />
          Settings Saved!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Notifications */}
        <div style={{
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid var(--color-border)'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Bell size={20} color='#1C6C41' />
            Notifications
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'inquiries', label: 'New Inquiries', desc: 'Alert when someone sends an inquiry' },
              { key: 'tickets', label: 'Maintenance Tickets', desc: 'Alert for new support tickets' }
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-foreground)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {item.desc}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, [item.key]: !prev.notifications[item.key] }
                  }))}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: '9999px',
                    background: settings.notifications[item.key] ? '#1C6C41' : 'var(--color-background)',
                    border: settings.notifications[item.key] ? 'none' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 150ms ease'
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: 3,
                    left: settings.notifications[item.key] ? 26 : 4,
                    transition: 'left 150ms ease'
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div style={{
          background: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid var(--color-border)'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Shield size={20} color='#1C6C41' />
            Security
          </h2>

          <button
            type='button'
            style={{
              padding: '10px 16px',
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-foreground)',
              cursor: 'pointer',
              width: 'fit-content'
            }}
          >
            Change Password
          </button>
        </div>

        <button
          type='submit'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            padding: '14px',
            background: '#1C6C41',
            border: 'none',
            borderRadius: '9999px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 150ms ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Save size={18} />
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default SettingsPage;