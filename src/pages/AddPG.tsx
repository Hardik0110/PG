import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Home, FileText } from 'lucide-react';
import { apiRequest } from '../lib/api';

function AddPG() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    type: 'gents',
    amenities: []
  });
  const photos = [];
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const amenityOptions = [
    { name: 'WiFi', category: 'connectivity' },
    { name: 'AC', category: 'comfort' },
    { name: 'Power Backup', category: 'utilities' },
    { name: 'Laundry', category: 'cleaning' },
    { name: 'Meals Included', category: 'food' },
    { name: 'Parking', category: 'facility' },
    { name: 'Security', category: 'safety' },
    { name: 'TV', category: 'entertainment' },
    { name: 'Attached Bathroom', category: 'comfort' },
    { name: 'Balcony', category: 'comfort' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenityName) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityName)
        ? prev.amenities.filter(a => a !== amenityName)
        : [...prev.amenities, amenityName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // 1) Create the PG
      const created = await apiRequest('/api/v1/pg-facilities/', {
        method: 'POST',
        body: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          description: formData.description || null,
          type: formData.type,
          is_active: true,
        },
      });
      // 2) Link selected amenities (look up master list, match by name)
      if (formData.amenities.length > 0 && created?.id) {
        try {
          const allAmenities = await apiRequest('/api/v1/amenities/');
          const byName = Object.fromEntries(
            (Array.isArray(allAmenities) ? allAmenities : []).map(a => [a.name.toLowerCase(), a.id])
          );
          for (const name of formData.amenities) {
            const aid = byName[name.toLowerCase()];
            if (aid) {
              await apiRequest(`/api/v1/amenities/pg/${created.id}`, {
                method: 'POST',
                body: { amenity_id: aid },
              });
            }
          }
        } catch (err) {
          console.warn('Amenity linking partially failed:', err.message);
        }
      }
      setShowSuccess(true);
      setTimeout(() => navigate('/pgs'), 1200);
    } catch (err) {
      console.error('Failed to create PG:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          zIndex: 'var(--z-toast)',
          boxShadow: '0 8px 32px rgba(5, 150, 105, 0.4)'
        }}>
          <Check size={24} />
          PG Added Successfully!
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '8px'
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-muted-foreground)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-foreground)',
          margin: 0
        }}>
          Add New PG
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{
        background: 'var(--color-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-border)'
      }}>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Home size={18} color='#1C6C41' />
            Basic Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-muted-foreground)',
                marginBottom: '6px'
              }}>
                PG Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Sunny PG"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  transition: 'border-color 150ms ease'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-muted-foreground)',
                marginBottom: '6px'
              }}>
                PG Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  background: 'var(--color-card)',
                  cursor: 'pointer'
                }}
              >
                <option value="gents">Gents</option>
                <option value="girls">Girls</option>
                <option value="coed">Co-ed</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={18} color='#1C6C41' />
            Location
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-muted-foreground)',
                marginBottom: '6px'
              }}>
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Full address"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-muted-foreground)',
                marginBottom: '6px'
              }}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="City name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-muted-foreground)',
                marginBottom: '6px'
              }}>
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="State name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-muted-foreground)',
                marginBottom: '6px'
              }}>
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                placeholder="6-digit pincode"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
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

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={18} color='#1C6C41' />
            Description
          </h2>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your PG, what's special about it, house rules, nearby landmarks..."
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-foreground)',
            marginBottom: '16px'
          }}>
            Amenities
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px'
          }}>
            {amenityOptions.map((amenity) => (
              <button
                key={amenity.name}
                type="button"
                onClick={() => toggleAmenity(amenity.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: formData.amenities.includes(amenity.name)
                    ? '2px solid #1C6C41'
                    : '1px solid var(--color-border)',
                  background: formData.amenities.includes(amenity.name)
                    ? 'rgba(28,108,65,0.08)'
                    : 'var(--color-card)',
                  color: formData.amenities.includes(amenity.name)
                    ? '#1C6C41'
                    : 'var(--color-muted-foreground)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {formData.amenities.includes(amenity.name) && <Check size={14} />}
                {amenity.name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            background: '#1C6C41',
            border: 'none',
            borderRadius: '9999px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 150ms ease',
            opacity: submitting ? 0.7 : 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {submitting ? 'Publishing...' : 'Publish PG'}
        </button>
      </form>
    </div>
    </div>
  );
}

export default AddPG;
