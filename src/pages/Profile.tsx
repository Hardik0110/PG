import { useEffect, useState } from 'react';
import { User, Mail, Phone, Save, Check } from 'lucide-react';
import { apiRequest, unwrapData } from '../lib/api';
import { filterPhone, isValidEmail, isValidPhone } from '../lib/validation';

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = name === 'phone' ? filterPhone(value) : value;
    setFormData({ ...formData, [name]: next });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await apiRequest('/api/v1/users/me', {
        method: 'PATCH',
        body: {
          full_name: formData.fullName,
          phone_number: formData.phone || null,
        },
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
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
            gap: '14px',
            marginBottom: '28px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#1C6C41,#3DBF7E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0
            }}>
              {(formData.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formData.fullName || 'Your name'}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-muted-foreground)', margin: '2px 0 0' }}>
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
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit phone"
                  aria-invalid={(formData.phone.length > 0 && !isValidPhone(formData.phone)) || undefined}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    border: `1px solid ${formData.phone.length > 0 && !isValidPhone(formData.phone) ? '#F87171' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none'
                  }}
                />
              </div>
              {formData.phone.length > 0 && !isValidPhone(formData.phone) && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>
                  Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
                </p>
              )}
              {errors.phone && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>{errors.phone}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#1C6C41',
                border: 'none',
                borderRadius: '9999px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                boxShadow: '0 1px 2px rgba(28,108,65,0.15)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(28,108,65,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(28,108,65,0.15)'; }}
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
