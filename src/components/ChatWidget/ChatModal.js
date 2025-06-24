import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import styles from './ChatWidget.module.css';

const ChatModal = ({ user, onClose, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  // Get or create chat ID for user
  const getOrCreateChatId = async (userId, userName) => {
    const chatRef = doc(db, 'userChats', userId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      return userId; // userId is also chatId
    } else {
      await setDoc(chatRef, {
        createdAt: serverTimestamp(),
        userId: userId,
        userName: userName,
        participants: {
          [userId]: true,
          admin: true
        },
        lastMessage: {
          text: '',
          timestamp: null,
          read: true,
          status: 'sent',
          senderId: '',
          isAdmin: false
        }
      });
      return userId;
    }
  };


  useEffect(() => {
    if (!user) return;

    const initializeChat = async () => {
      const id = await getOrCreateChatId(user.uid, user.displayName || 'Guest');
      setChatId(id);
    };

    initializeChat();
  }, [user]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'userChats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setMessages(messagesData);

      // Notify parent about new messages when chat is closed
      if (onNewMessage) {
        const newMessages = messagesData.filter(msg =>
          msg.senderId !== user?.uid &&
          !msg.read &&
          msg.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        onNewMessage(newMessages.length);
      }
    });

    return () => unsubscribe();
  }, [chatId, user, onNewMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    const isAdmin = user.email.includes('@eliesports.com');

    const messagesRef = collection(db, 'userChats', chatId, 'messages');

    const messageData = {
      text: newMessage,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      isAdmin,
      status: 'sent',
      read: false
    };

    await addDoc(messagesRef, messageData);

    // Update the lastMessage field in the conversation
    const chatRef = doc(db, 'userChats', chatId);
    await setDoc(chatRef, {
      lastMessage: messageData,
      userId: chatId,
    }, { merge: true });

    setNewMessage('');
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatModal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Customer Support</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.noMessages}>
              <p>How can we help you today?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${message.senderId === user?.uid ? styles.sent : styles.received}`}
              >
                {message.senderId !== user?.uid && (
                  <div className={styles.senderName}>
                    {message.isAdmin ? 'Support Agent' : message.senderEmail.split('@')[0]}
                  </div>
                )}
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{message.text}</div>
                  <div className={styles.messageMeta}>
                    <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
                    {message.senderId === user?.uid && (
                      <span className={styles.messageStatus}>
                        {message.status === 'sent' ? '✓' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.messageForm}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className={styles.messageInput}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!newMessage.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;