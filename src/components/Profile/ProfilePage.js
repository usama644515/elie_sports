import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  setDoc 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged, updateEmail, updatePassword } from 'firebase/auth';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    sameAsShipping: false
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check auth state and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          // Fetch user data from Firestore
          const q = query(collection(db, "users"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            setUserData(data);
            
            // Set form values
            setProfileForm({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              phone: data.phone || '',
              email: user.email || ''
            });

            if (data.shippingAddress) {
              setShippingAddress(data.shippingAddress);
            }

            if (data.billingAddress) {
              setBillingAddress(data.billingAddress);
            } else if (data.shippingAddress) {
              // Default billing to shipping if not set
              setBillingAddress(prev => ({
                ...prev,
                sameAsShipping: true
              }));
            }
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, "users", user.uid), {
              userId: user.uid,
              email: user.email,
              createdAt: new Date()
            });
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to load your profile. Please try again.");
          setLoading(false);
        }
      } else {
        router.push("/login?redirect=/profile");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Handle form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    
    // Update billing address if "same as shipping" is checked
    if (billingAddress.sameAsShipping) {
      setBillingAddress(prev => ({ 
        ...prev, 
        [name]: value,
        sameAsShipping: true
      }));
    }
  };

  const handleBillingChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'sameAsShipping') {
      setBillingAddress(prev => ({ 
        ...prev, 
        sameAsShipping: checked,
        ...(checked ? shippingAddress : {})
      }));
    } else {
      setBillingAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Update email if changed
      if (profileForm.email !== user.email) {
        await updateEmail(user, profileForm.email);
      }

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        updatedAt: new Date()
      });

      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setLoading(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile. Please try again.");
      setLoading(false);
    }
  };

  // Update password
  const updateUserPassword = async () => {
    if (!user || !passwordForm.newPassword) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      await updatePassword(user, passwordForm.newPassword);

      setSuccess('Password updated successfully!');
      setPasswordMode(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setError(error.message || "Failed to update password. Please try again.");
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>My Profile</h1>
        <p className={styles.pageSubtitle}>Manage your account information</p>
      </header>

      <div className={styles.profileLayout}>
        <nav className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
            </div>
            <div className={styles.profileInfo}>
              <h3>{profileForm.firstName} {profileForm.lastName}</h3>
              <p>{user?.email}</p>
            </div>
          </div>

          <ul className={styles.navMenu}>
            <li 
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </li>
            <li 
              className={`${styles.navItem} ${activeTab === 'shipping' ? styles.active : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping Address
            </li>
            <li 
              className={`${styles.navItem} ${activeTab === 'billing' ? styles.active : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              Billing Address
            </li>
            <li 
              className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </li>
          </ul>
        </nav>

        <main className={styles.mainContent}>
          {success && (
            <div className={styles.successAlert}>
              <span className={styles.successIcon}>✓</span>
              {success}
            </div>
          )}

          {activeTab === 'profile' && (
            <section className={styles.profileSection}>
              <div className={styles.sectionHeader}>
                <h2>Profile Information</h2>
                {!editMode ? (
                  <button 
                    className={styles.editButton}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.cancelButton}
                      onClick={() => {
                        setEditMode(false);
                        setError('');
                        // Reset form to original values
                        setProfileForm({
                          firstName: userData.firstName || '',
                          lastName: userData.lastName || '',
                          phone: userData.phone || '',
                          email: user?.email || ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className={styles.saveButton}
                      onClick={saveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className={styles.profileField}>
                        {profileForm.firstName || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className={styles.profileField}>
                        {profileForm.lastName || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className={styles.profileField}>
                      {profileForm.email}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className={styles.profileField}>
                      {profileForm.phone || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'shipping' && (
            <section className={styles.addressSection}>
              <div className={styles.sectionHeader}>
                <h2>Shipping Address</h2>
                <button 
                  className={styles.editButton}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <form className={styles.addressForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="shippingName">Full Name</label>
                    <input
                      type="text"
                      id="shippingName"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleShippingChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="shippingAddress">Street Address</label>
                    <input
                      type="text"
                      id="shippingAddress"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleShippingChange}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="shippingCity">City</label>
                      <input
                        type="text"
                        id="shippingCity"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        placeholder="New York"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="shippingState">State</label>
                      <input
                        type="text"
                        id="shippingState"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleShippingChange}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="shippingZip">ZIP Code</label>
                      <input
                        type="text"
                        id="shippingZip"
                        name="zip"
                        value={shippingAddress.zip}
                        onChange={handleShippingChange}
                        placeholder="10001"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="shippingCountry">Country</label>
                      <select
                        id="shippingCountry"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button"
                      className={styles.saveButton}
                      onClick={saveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.addressDisplay}>
                  {shippingAddress.name ? (
                    <>
                      <p>{shippingAddress.name}</p>
                      <p>{shippingAddress.address}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                      <p>{shippingAddress.country}</p>
                    </>
                  ) : (
                    <p className={styles.noAddress}>No shipping address saved</p>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'billing' && (
            <section className={styles.addressSection}>
              <div className={styles.sectionHeader}>
                <h2>Billing Address</h2>
                <button 
                  className={styles.editButton}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <form className={styles.addressForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="sameAsShipping"
                        checked={billingAddress.sameAsShipping}
                        onChange={handleBillingChange}
                      />
                      <span>Same as shipping address</span>
                    </label>
                  </div>

                  {!billingAddress.sameAsShipping && (
                    <>
                      <div className={styles.formGroup}>
                        <label htmlFor="billingName">Full Name</label>
                        <input
                          type="text"
                          id="billingName"
                          name="name"
                          value={billingAddress.name}
                          onChange={handleBillingChange}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="billingAddress">Street Address</label>
                        <input
                          type="text"
                          id="billingAddress"
                          name="address"
                          value={billingAddress.address}
                          onChange={handleBillingChange}
                          placeholder="123 Main St"
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="billingCity">City</label>
                          <input
                            type="text"
                            id="billingCity"
                            name="city"
                            value={billingAddress.city}
                            onChange={handleBillingChange}
                            placeholder="New York"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="billingState">State</label>
                          <input
                            type="text"
                            id="billingState"
                            name="state"
                            value={billingAddress.state}
                            onChange={handleBillingChange}
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="billingZip">ZIP Code</label>
                          <input
                            type="text"
                            id="billingZip"
                            name="zip"
                            value={billingAddress.zip}
                            onChange={handleBillingChange}
                            placeholder="10001"
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="billingCountry">Country</label>
                          <select
                            id="billingCountry"
                            name="country"
                            value={billingAddress.country}
                            onChange={handleBillingChange}
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.formActions}>
                    <button 
                      type="button"
                      className={styles.saveButton}
                      onClick={saveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.addressDisplay}>
                  {billingAddress.sameAsShipping ? (
                    <>
                      <p>Same as shipping address</p>
                      {shippingAddress.name && (
                        <>
                          <p>{shippingAddress.name}</p>
                          <p>{shippingAddress.address}</p>
                          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                          <p>{shippingAddress.country}</p>
                        </>
                      )}
                    </>
                  ) : billingAddress.name ? (
                    <>
                      <p>{billingAddress.name}</p>
                      <p>{billingAddress.address}</p>
                      <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zip}</p>
                      <p>{billingAddress.country}</p>
                    </>
                  ) : (
                    <p className={styles.noAddress}>No billing address saved</p>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'security' && (
            <section className={styles.securitySection}>
              <div className={styles.sectionHeader}>
                <h2>Security Settings</h2>
                {passwordMode && (
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setPasswordMode(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!passwordMode ? (
                <>
                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <h3>Password</h3>
                      <p>••••••••••</p>
                    </div>
                    <button 
                      className={styles.changeButton}
                      onClick={() => setPasswordMode(true)}
                    >
                      Change Password
                    </button>
                  </div>

                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <h3>Two-Factor Authentication</h3>
                      <p>Not enabled</p>
                    </div>
                    <button 
                      className={styles.changeButton}
                      onClick={() => alert('Two-factor authentication will be available soon!')}
                    >
                      Enable
                    </button>
                  </div>
                </>
              ) : (
                <form className={styles.passwordForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button"
                      className={styles.saveButton}
                      onClick={updateUserPassword}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;