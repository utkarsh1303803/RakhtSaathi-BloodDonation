// Needy side - See donor's live location like Rapido/Uber
import React, { useState, useEffect, useRef } from 'react';
import { locationService } from '../services/locationService';

const NeedyLiveTracking = ({ requestId, donorInfo }) => {
  const [donorLocation, setDonorLocation] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [status, setStatus] = useState('WAITING');
  const [updateCount, setUpdateCount] = useState(0);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pathPointsRef = useRef([]); // Track movement trail

  useEffect(() => {
    // Connect WebSocket
    locationService.connect(
      () => {
        setWsConnected(true);
        // Subscribe to donor location
        setTimeout(() => {
          locationService.subscribeToLocation(requestId, handleLocationUpdate);
        }, 500);
      },
      () => setWsConnected(false)
    );

    // Try to get last known location via REST
    locationService.getLastLocation(requestId).then((loc) => {
      if (loc?.latitude) handleLocationUpdate(loc);
    });

    return () => {
      locationService.unsubscribeFromLocation(requestId);
      locationService.disconnect();
    };
  }, [requestId]);

  const handleLocationUpdate = (location) => {
    setDonorLocation(location);
    setLastUpdated(new Date());
    setUpdateCount(c => c + 1);

    if (location.status === 'ARRIVED') {
      setStatus('ARRIVED');
    } else if (location.status === 'EN_ROUTE' || location.status === 'ACCEPTED') {
      setStatus('EN_ROUTE');
    }

    updateMap(location.latitude, location.longitude);
  };

  // Initialize OpenStreetMap (free, no API key needed)
  useEffect(() => {
    if (!donorLocation || mapInstanceRef.current) return;
    loadMap(donorLocation.latitude, donorLocation.longitude);
  }, [donorLocation]);

  const loadMap = (lat, lng) => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Check if Leaflet already loaded
    if (window.L) {
      initLeafletMap(lat, lng);
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => initLeafletMap(lat, lng);
    script.onerror = () => console.warn('Leaflet failed to load, map unavailable');
    document.head.appendChild(script);
  };

  const initLeafletMap = (lat, lng) => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      const L = window.L;
      const map = L.map(mapRef.current).setView([lat, lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const donorIcon = L.divIcon({
        html: `<div style="
          background:#dc2626;color:white;border-radius:50% 50% 50% 0;
          width:40px;height:40px;display:flex;align-items:center;
          justify-content:center;font-size:20px;transform:rotate(-45deg);
          border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
          <span style="transform:rotate(45deg)">🩸</span>
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      markerRef.current = L.marker([lat, lng], { icon: donorIcon })
        .addTo(map)
        .bindPopup(`<b>🩸 ${donorInfo?.name || 'Donor'}</b><br>On the way!`)
        .openPopup();

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Map init error:', err);
    }
  };

  const updateMap = (lat, lng) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const L = window.L;
    if (!L) return;

    const currentLatLng = markerRef.current.getLatLng();
    const targetLatLng = L.latLng(lat, lng);

    // Smooth marker animation
    const steps = 20;
    const stepLat = (lat - currentLatLng.lat) / steps;
    const stepLng = (lng - currentLatLng.lng) / steps;
    let step = 0;

    const animate = () => {
      if (step >= steps) return;
      step++;
      markerRef.current?.setLatLng([
        currentLatLng.lat + stepLat * step,
        currentLatLng.lng + stepLng * step
      ]);
      requestAnimationFrame(animate);
    };
    animate();

    // Pan map to follow donor
    mapInstanceRef.current.panTo(targetLatLng, { animate: true, duration: 1.0 });

    // Draw movement trail (blue dotted line)
    pathPointsRef.current.push([lat, lng]);
    if (pathPointsRef.current.length > 1) {
      // Remove old polyline if exists
      if (mapInstanceRef.current._pathLine) {
        mapInstanceRef.current.removeLayer(mapInstanceRef.current._pathLine);
      }
      // Draw new trail
      mapInstanceRef.current._pathLine = L.polyline(pathPointsRef.current, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.6,
        dashArray: '8, 8'
      }).addTo(mapInstanceRef.current);
    }
  };

  const statusConfig = {
    WAITING: { color: '#f59e0b', bg: '#fef3c7', icon: '⏳', text: 'Waiting for donor to start...' },
    EN_ROUTE: { color: '#3b82f6', bg: '#eff6ff', icon: '🚗', text: 'Donor is on the way!' },
    ARRIVED: { color: '#059669', bg: '#f0fdf4', icon: '🏥', text: 'Donor has arrived at hospital!' },
  };

  const cfg = statusConfig[status];

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: `2px solid ${cfg.color}`, marginBottom: '20px' }}>

      {/* Status Header */}
      <div style={{ backgroundColor: cfg.bg, padding: '15px 20px', borderBottom: `1px solid ${cfg.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: cfg.color, fontSize: '18px' }}>
              {cfg.icon} {cfg.text}
            </h3>
            {donorInfo && (
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#374151' }}>
                Donor: <strong>{donorInfo.name || 'Rahul Sharma'}</strong>
                {donorInfo.phone && <> | 📞 <a href={`tel:${donorInfo.phone}`} style={{ color: cfg.color }}>{donorInfo.phone}</a></>}
              </p>
            )}
          </div>
          <div style={{
            width: '12px', height: '12px',
            borderRadius: '50%',
            backgroundColor: wsConnected ? '#059669' : '#f59e0b',
            boxShadow: wsConnected ? '0 0 0 3px rgba(5,150,105,0.3)' : 'none'
          }} title={wsConnected ? 'Live' : 'Connecting...'} />
        </div>
      </div>

      {/* Live Map */}
      {donorLocation ? (
        <div>
          <div
            ref={mapRef}
            style={{ height: '300px', width: '100%', backgroundColor: '#e5e7eb' }}
          />

          {/* Location Info Bar */}
          <div style={{
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '10px 15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}>
            <span>
              📍 {donorLocation.latitude?.toFixed(4)}, {donorLocation.longitude?.toFixed(4)}
            </span>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {updateCount > 1 && (
                <span style={{ color: '#60a5fa' }}>
                  🛣️ {updateCount} updates
                </span>
              )}
              {lastUpdated && (
                <span style={{ color: '#9ca3af' }}>
                  🔄 {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Waiting State */
        <div style={{
          height: '250px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          gap: '15px'
        }}>
          <div style={{ fontSize: '48px' }}>🩸</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#374151', fontWeight: 'bold', margin: 0 }}>
              Waiting for donor to share location...
            </p>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '5px 0 0 0' }}>
              Map will appear automatically when donor starts moving
            </p>
          </div>
          {/* Animated dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                opacity: 0.6,
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Arrived Banner */}
      {status === 'ARRIVED' && (
        <div style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '15px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          🎉 Donor has arrived! Please proceed to the blood bank counter.
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NeedyLiveTracking;
