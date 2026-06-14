// Real-time Notification Service for BloodSaathi
import { onSnapshot, query, where, collection, orderBy, limit, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.audioContext = null;
    this.isInitialized = false;
    this.notificationPermission = 'default';
    this.init();
  }

  async init() {
    try {
      // Request notification permission
      if ('Notification' in window) {
        this.notificationPermission = await Notification.requestPermission();
        console.log('🔔 Notification permission:', this.notificationPermission);
      }

      // Initialize audio context for emergency sounds
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🔊 Audio context initialized');
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  }

  // Generate emergency beep sound
  generateEmergencyBeep(frequency = 800, duration = 200, volume = 0.3) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

      console.log('🔊 Emergency beep played');
    } catch (error) {
      console.error('❌ Error playing emergency beep:', error);
    }
  }

  // Play emergency alert sequence
  playEmergencyAlert() {
    if (!this.audioContext) return;

    // Play 3 beeps with increasing frequency
    setTimeout(() => this.generateEmergencyBeep(600, 150), 0);
    setTimeout(() => this.generateEmergencyBeep(800, 150), 200);
    setTimeout(() => this.generateEmergencyBeep(1000, 200), 400);

    console.log('🚨 Emergency alert sequence played');
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (this.notificationPermission !== 'granted') {
      console.log('⚠️ Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) {
          options.onClick();
        }
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      console.log('🔔 Browser notification shown:', title);
      return notification;
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  // Listen for new blood requests (for donors)
  listenForBloodRequests(donorId, city, bloodGroups, callback) {
    const listenerId = `blood-requests-${donorId}`;
    
    try {
      // Stop existing listener if any
      this.stopListener(listenerId);

      // Create query for blood requests in donor's city
      const q = query(
        collection(db, 'bloodRequests'),
        where('city', '==', city),
        where('status', '==', 'ACTIVE'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      console.log('🔍 Setting up blood request listener for:', { donorId, city, bloodGroups });

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newRequests = [];
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const request = { id: change.doc.id, ...change.doc.data() };
            
            // Check if this request is compatible with donor's blood groups
            if (bloodGroups.includes(request.bloodGroup)) {
              // Check if this donor was already notified
              const notifiedDonors = request.notifiedDonors || {};
              if (!notifiedDonors[donorId]) {
                newRequests.push(request);
                console.log('🆕 New compatible blood request:', request.patientName, request.bloodGroup);
              }
            }
          }
        });

        if (newRequests.length > 0) {
          // Play emergency alert for new requests
          this.playEmergencyAlert();

          // Show browser notification
          const firstRequest = newRequests[0];
          this.showNotification(
            `🩸 Emergency Blood Request - ${firstRequest.bloodGroup}`,
            {
              body: `Patient: ${firstRequest.patientName}\nHospital: ${firstRequest.hospital}\nUrgency: ${firstRequest.urgency}`,
              tag: 'blood-request',
              requireInteraction: true,
              onClick: () => {
                // Navigate to request details
                window.location.href = `/donor/request/${firstRequest.id}`;
              }
            }
          );

          // Call the callback with new requests
          if (callback) {
            callback(newRequests);
          }
        }
      }, (error) => {
        console.error('❌ Error in blood request listener:', error);
      });

      this.listeners.set(listenerId, unsubscribe);
      console.log('✅ Blood request listener started');

    } catch (error) {
      console.error('❌ Error setting up blood request listener:', error);
    }
  }

  // Listen for donor responses (for needy users)
  listenForDonorResponses(requestId, callback) {
    const listenerId = `donor-responses-${requestId}`;
    
    try {
      // Stop existing listener if any
      this.stopListener(listenerId);

      console.log('🔍 Setting up donor response listener for request:', requestId);

      const unsubscribe = onSnapshot(
        doc(db, 'bloodRequests', requestId),
        (doc) => {
          if (doc.exists()) {
            const request = { id: doc.id, ...doc.data() };
            const notifiedDonors = request.notifiedDonors || {};
            
            // Check for new responses
            const responses = Object.entries(notifiedDonors).filter(
              ([donorId, data]) => data.status === 'ACCEPTED' || data.status === 'REJECTED'
            );

            if (responses.length > 0) {
              const acceptedCount = responses.filter(([_, data]) => data.status === 'ACCEPTED').length;
              
              if (acceptedCount > 0) {
                // Play success sound for accepted responses
                this.generateEmergencyBeep(1200, 300, 0.2);

                // Show notification
                this.showNotification(
                  `✅ Donor Response Received!`,
                  {
                    body: `${acceptedCount} donor(s) have accepted your blood request`,
                    tag: 'donor-response',
                    onClick: () => {
                      window.location.href = `/needy/request/${requestId}`;
                    }
                  }
                );
              }

              // Call the callback with updated request
              if (callback) {
                callback(request);
              }
            }
          }
        },
        (error) => {
          console.error('❌ Error in donor response listener:', error);
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      console.log('✅ Donor response listener started');

    } catch (error) {
      console.error('❌ Error setting up donor response listener:', error);
    }
  }

  // Stop a specific listener
  stopListener(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      console.log('🛑 Stopped listener:', listenerId);
    }
  }

  // Stop all listeners
  stopAllListeners() {
    this.listeners.forEach((unsubscribe, listenerId) => {
      unsubscribe();
      console.log('🛑 Stopped listener:', listenerId);
    });
    this.listeners.clear();
    console.log('🛑 All listeners stopped');
  }

  // Text-to-speech for emergency messages
  speak(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;

        speechSynthesis.speak(utterance);
        console.log('🗣️ Speaking:', text);
      } catch (error) {
        console.error('❌ Error with text-to-speech:', error);
      }
    }
  }

  // Vibrate device (mobile)
  vibrate(pattern = [200, 100, 200]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
        console.log('📳 Device vibrated');
      } catch (error) {
        console.error('❌ Error vibrating device:', error);
      }
    }
  }

  // Send emergency notification (combines all methods)
  sendEmergencyNotification(title, message, options = {}) {
    console.log('🚨 Sending emergency notification:', title);

    // Play emergency alert
    this.playEmergencyAlert();

    // Show browser notification
    this.showNotification(title, {
      body: message,
      requireInteraction: true,
      ...options
    });

    // Speak the message
    if (options.speak !== false) {
      this.speak(`Emergency: ${title}. ${message}`);
    }

    // Vibrate device
    this.vibrate([300, 100, 300, 100, 300]);
  }

  // Legacy methods for backward compatibility
  initialize = async () => {
    return this.isInitialized;
  }

  playNotificationSound = async () => {
    this.generateEmergencyBeep();
    return true;
  }

  cleanup = () => {
    this.stopAllListeners();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
    }
    this.audioContext = null;
  }

  // Get notification status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      notificationPermission: this.notificationPermission,
      hasAudioContext: !!this.audioContext,
      activeListeners: this.listeners.size,
      listenerIds: Array.from(this.listeners.keys())
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Legacy exports for backward compatibility
export const initialize = notificationService.initialize;
export const playNotificationSound = notificationService.playNotificationSound;
export const cleanup = notificationService.cleanup;

export default notificationService;