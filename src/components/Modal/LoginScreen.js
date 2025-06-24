// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import Head from 'next/head';
import Link from 'next/link';
import styles from './LoginScreen.module.css';
import {
  FaGoogle,
  FaEnvelope,
  FaLock,
  FaUser,
  FaSpinner,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in or use a different email.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const fullName = user.displayName || '';
      const nameParts = fullName.trim().split(' ');

      await setDoc(userRef, {
        email: user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        createdAt: new Date(),
      }, { merge: true });

      const chatRef = doc(db, 'userChats', user.uid);
      await setDoc(chatRef, {
        userId: user.uid,
        userName: user.displayName || '',
        participants: {
          [user.uid]: true,
          admin: true,
        },
        createdAt: serverTimestamp(),
        lastMessage: {
          text: '',
          senderId: '',
          isAdmin: false,
          read: true,
          status: 'sent',
          timestamp: null,
        }
      });

      router.push('/');
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!isLogin && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      let user;

      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          email: user.email,
          firstName: name,
          lastName,
          createdAt: new Date(),
        });

        const chatRef = doc(db, 'userChats', user.uid);
        await setDoc(chatRef, {
          userId: user.uid,
          userName: name || '',
          participants: {
            [user.uid]: true,
            admin: true
          },
          createdAt: serverTimestamp(),
          lastMessage: {
            text: '',
            senderId: '',
            isAdmin: false,
            read: true,
            status: 'sent',
            timestamp: null
          }
        });
      }

      setEmail('');
      setPassword('');
      setName('');
      setLastName('');
      setErrorMessage('');
      setLoading(false);
      setGoogleLoading(false);
      setShowPassword(false);
      setIsLogin(true);

      router.push('/');
    } catch (error) {
      console.error('Email/password auth error:', error);
      setErrorMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
    setPassword('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Head>
        <title>{isLogin ? 'Login' : 'Sign Up'} | Your App Name</title>
        <meta name="description" content={isLogin ? 'Login to your account' : 'Create a new account'} />
      </Head>

      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logo}>Y</div>
          </Link>

          <div className={styles.header}>
            <h2 className={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className={styles.subtitle}>
              {isLogin ? 'Log in to your account' : 'Sign up to get started'}
            </p>
          </div>

          <div className={styles.socialButtons}>
            <button
              className={`${styles.socialButton} ${styles.google}`}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <FaSpinner className={`${styles.socialIcon} ${styles.spinner}`} />
              ) : (
                <>
                  <FaGoogle className={styles.socialIcon} />
                  {isLogin ? 'Login with Google' : 'Sign up with Google'}
                </>
              )}
            </button>
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <form onSubmit={handleEmailAuth} className={styles.form}>
            {!isLogin && (
              <>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First Name"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className={styles.input}
                    required
                  />
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <FaLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.input}
                required
                minLength="6"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {!isLogin && password.length > 0 && password.length < 6 && (
              <p className={styles.passwordHint}>
                Password must be at least 6 characters
              </p>
            )}

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || (!isLogin && password.length < 6)}
            >
              {loading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  {isLogin ? ' Logging in...' : ' Creating account...'}
                </>
              ) : isLogin ? 'Login' : 'Sign Up'}
            </button>

            <div className={styles.footer}>
              <p className={styles.footerText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button type="button" className={styles.toggleButton} onClick={toggleAuthMode}>
                  {isLogin ? ' Sign Up' : ' Login'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
