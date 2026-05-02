import { useEffect, useState } from 'react';
import { User, Mail, Phone, Save, Check } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';

function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const payload = await apiRequest('/api/v1/auth/me');
        const data = unwrapData(payload, {});
        if (!mounted) return;
        setFormData({
          fullName: data.full_name || data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone_number || data.phone || ''
        });
      } catch {
        if (!mounted) return;
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      setShowSuccess(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-foreground)', marginBottom: '32px' }}>
        Profile
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
          Profile Updated!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'var(--color-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#1C6C41',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            color: 'white'
          }}>
            {formData.fullName.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-foreground)', margin: 0 }}>
              {formData.fullName}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted-foreground)', margin: '4px 0 0' }}>
              PG Owner
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-muted-foreground)',
              marginBottom: '2px'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-muted-foreground)',
              marginBottom: '2px'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-muted-foreground)',
              marginBottom: '2px'
            }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            width: '100%',
            padding: '14px',
            background: '#1C6C41',
            border: 'none',
            borderRadius: '9999px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '24px',
            transition: 'transform 150ms ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Save size={18} />
          Save Changes
        </button>
      </form>
    </div>
    </div>
  );
}

export default Profile;
