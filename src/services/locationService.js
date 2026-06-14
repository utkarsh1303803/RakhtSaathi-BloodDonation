// Live Location Tracking Service - Rapido/Uber style
import { Client } from '@stomp/stompjs';

const WS_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class LocationService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
  }

  // Connect to WebSocket server
  connect(onConnected, onError) {
    this.client = new Client({
      brokerURL: WS_URL.replace('http', 'ws') + '/ws/websocket',
      webSocketFactory: () => {
        // Use native WebSocket with SockJS fallback
        try {
          const SockJS = require('sockjs-client');
          return new SockJS(`${WS_URL}/ws`);
        } catch {
          return new WebSocket(WS_URL.replace('http', 'ws') + '/ws/websocket');
        }
      },
      reconnectDelay: 3000,
      onConnect: () => {
        console.log('✅ WebSocket connected');
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket STOMP error:', frame);
        if (onError) onError(frame);
      },
      onWebSocketError: (event) => {
        console.error('❌ WebSocket connection error:', event);
        if (onError) onError(event);
      },
    });
    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.subscriptions = {};
  }

  // DONOR: Send live location every 5 seconds
  startSharingLocation(requestId, donorName, onError) {
    if (!navigator.geolocation) {
      if (onError) onError('Geolocation not supported');
      return null;
    }

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (this.client?.connected) {
            this.client.publish({
              destination: '/app/location',
              body: JSON.stringify({
                requestId,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                donorName,
                status: 'EN_ROUTE',
                timestamp: Date.now(),
              }),
            });
          }
        },
        (err) => console.warn('GPS error:', err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }, 5000);

    // Send first update immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (this.client?.connected) {
          this.client.publish({
            destination: '/app/location',
            body: JSON.stringify({
              requestId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              donorName,
              status: 'ACCEPTED',
              timestamp: Date.now(),
            }),
          });
        }
      },
      () => {},
      { enableHighAccuracy: true }
    );

    return intervalId;
  }

  stopSharingLocation(intervalId) {
    if (intervalId) clearInterval(intervalId);
  }

  // NEEDY: Subscribe to donor location updates
  subscribeToLocation(requestId, onLocationUpdate) {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected yet');
      return;
    }

    const sub = this.client.subscribe(
      `/topic/location/${requestId}`,
      (message) => {
        const location = JSON.parse(message.body);
        onLocationUpdate(location);
      }
    );

    this.subscriptions[requestId] = sub;
    return sub;
  }

  unsubscribeFromLocation(requestId) {
    if (this.subscriptions[requestId]) {
      this.subscriptions[requestId].unsubscribe();
      delete this.subscriptions[requestId];
    }
  }

  // Mark donor as arrived
  async markArrived(requestId) {
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`${WS_URL}/api/location/${requestId}/arrived`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ARRIVED' }),
      });
    } catch (err) {
      console.error('Error marking arrived:', err);
    }
  }

  // Get last known location (REST fallback)
  async getLastLocation(requestId) {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${WS_URL}/api/location/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const locationService = new LocationService();
export default locationService;
