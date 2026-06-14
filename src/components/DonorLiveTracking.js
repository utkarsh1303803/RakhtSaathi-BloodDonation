// Donor side - Share live location after accepting request
import React, { useState, useEffect, useRef } from 'react';
import { locationService } from '../services/locationService';
import { useAuth } from '../context/AuthContext';

const DonorLiveTracking = ({ requestId, requestDetails, onArrived }) => {
  const { userProfile } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState('ACCEPTED'); // ACCEPTED, EN_ROUTE, ARRIVED
  const [currentLocation, setCurrentLocation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const donorName = userProfile?.fullName || userProfile?.name || 'Donor';

  useEffect(() => {
    // Connect WebSocket
    locationService.connect(
      () => setWsConnected(true),
      () => setError('Connection failed. Retrying...')
    );

    return () => {
      locationService.stopSharingLocation(intervalRef.current);
      locationService.disconnect();
    };
  }, []);

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError('Your device does not support GPS location sharing.');
      return;
    }

    setIsSharing(true);
    setStatus('EN_ROUTE');

    intervalRef.current = locationService.startSharingLocation(
      requestId,
      donorName,
      (err) => setError(err)
    );

    // Also track locally for display
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );

    intervalRef.current = { interval: intervalRef.current, watch: watchId };
  };

  const stopSharing = () => {
    if (intervalRef.current?.interval) clearInterval(intervalRef.current.interval);
    if (intervalRef.current?.watch) navigator.geolocation.clearWatch(intervalRef.current.watch);
    setIsSharing(false);
  };

  const handleArrived = async () => {
    setStatus('ARRIVED');
    stopSharing();
    await locationService.markArrived(requestId);
    if (onArrived) onArrived();
  };

  const statusColors = {
    ACCEPTED: '#f59e0b',
    EN_ROUTE: '#3b82f6',
    ARRIVED: '#059669',
  };

  const statusLabels = {
    ACCEPTED: '✅ Request Accepted',
    EN_ROUTE: '🚗 On the Way',
    ARRIVED: '🏥 Arrived at Hospital',
  };

  return (
    <div style={{
      border: `2px solid ${statusColors[status]}`,
      borderRadius: '12px',
      padding: '20px',
      backgroundColor: '#fff',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: statusColors[status], margin: '0 0 15px 0' }}>
        📍 Live Location Tracking
      </h3>

      {/* Status Badge */}
      <div style={{
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: statusColors[status],
        color: 'white',
        borderRadius: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
        fontSize: '14px'
      }}>
        {statusLabels[status]}
      </div>

      {/* Connection Status */}
      <div style={{ fontSize: '13px', color: wsConnected ? '#059669' : '#f59e0b', marginBottom: '15px' }}>
        {wsConnected ? '🟢 Connected - Location sharing active' : '🟡 Connecting...'}
      </div>

      {/* Destination Info */}
      {requestDetails && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '15px'
        }}>
          <strong style={{ color: '#dc2626' }}>🏥 Destination:</strong>
          <div style={{ marginTop: '5px', fontSize: '14px' }}>
            <div>{requestDetails.hospital}</div>
            <div style={{ color: '#6b7280' }}>{requestDetails.city}</div>
            <div style={{ marginTop: '5px' }}>
              <strong>Patient:</strong> {requestDetails.patientName} |
              <strong> Blood:</strong> {requestDetails.bloodGroup?.replace('_', '')}
            </div>
          </div>
        </div>
      )}

      {/* Current GPS */}
      {currentLocation && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '15px' }}>
          📡 GPS: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
        </div>
      )}

      {error && (
        <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!isSharing && status !== 'ARRIVED' && (
          <button
            onClick={startSharing}
            disabled={!wsConnected}
            style={{
              padding: '12px 20px',
              backgroundColor: wsConnected ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: wsConnected ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            📍 Start Sharing Location
          </button>
        )}

        {isSharing && (
          <button
            onClick={stopSharing}
            style={{
              padding: '12px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ⏹ Stop Sharing
          </button>
        )}

        {status !== 'ARRIVED' && (
          <button
            onClick={handleArrived}
            style={{
              padding: '12px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🏥 I've Arrived
          </button>
        )}
      </div>

      {isSharing && (
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite'
          }}></span>
          Sharing location every 5 seconds...
        </div>
      )}
    </div>
  );
};

export default DonorLiveTracking;
