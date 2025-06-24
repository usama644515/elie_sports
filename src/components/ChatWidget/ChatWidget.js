/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import ChatModal from './ChatModal';
import styles from './ChatWidget.module.css';
import LoginModal from '../Modal/LoginModal';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (isMounted) {
        setUser(user);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    if (!user) {
      openLoginModal();
    } else {
      if (!isOpen) {
        openChat();
      } else {
        closeChat();
      }
    }
  };

  const handleNewMessage = (count) => {
    if (!isOpen) {
      setUnreadCount((prev) => prev + count);
    }
  };

  return (
    <>
      <div
        className={`${styles.chatWidget} ${isOpen ? styles.hidden : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleChat()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <ChatModal
          user={user}
          onClose={closeChat}
          onNewMessage={handleNewMessage}
        />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onRequestClose={closeLoginModal}
      />
    </>
  );
};

export default ChatWidget;
