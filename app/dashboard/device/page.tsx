/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/device/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Link2, RefreshCw, Copy, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Device {
  id: string
  deviceId: string
  pairedAt: string | null
  mode: string
}

export default function DevicePage() {
  const [device, setDevice] = useState<Device | null>(null)
  const [deviceCode, setDeviceCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetchDevice()
  }, [])

  const fetchDevice = async () => {
    try {
      const res = await fetch('/api/device')
      const data = await res.json()
      setDevice(data)
    } catch (error) {
      toast.error('Failed to fetch device info')
    }
  }

  const pairDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to pair device')
      }

      toast.success('Device paired successfully!')
      setDevice(data)
      setDeviceCode('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const testSync = async () => {
    if (!device?.deviceId) {
      toast.error('No device ID available')
      return
    }

    setSyncStatus('idle')
    
    try {
      const url = `/api/device-sync?device_id=${encodeURIComponent(device.deviceId)}`
      console.log('Testing sync with URL:', url)
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (res.ok) {
        setSyncStatus('success')
        toast.success('Sync test successful!')
        console.log('Sync data received:', data)
      } else {
        setSyncStatus('error')
        throw new Error(data.error || 'Sync failed')
      }
    } catch (error: any) {
      setSyncStatus('error')
      toast.error('Sync test failed: ' + error.message)
    }
  }

  const copyDeviceId = () => {
    if (!device?.deviceId) return
    
    navigator.clipboard.writeText(device.deviceId)
    setCopied(true)
    toast.success('Device ID copied to clipboard')
    
    setTimeout(() => setCopied(false), 2000)
  }

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Device Pairing</h1>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6">
        {device ? (
          <>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Smartphone className="text-green-500" size={32} />
                <div>
                  <p className="font-medium">Connected</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Device ID: </p>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {device.deviceId}
                    </code>
                    <button
                      onClick={copyDeviceId}
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="Copy Device ID"
                    >
                      {copied ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                  {device.pairedAt && (
                    <p className="text-xs text-gray-400">
                      Paired: {new Date(device.pairedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={testSync}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
                title="Test sync with device"
              >
                <RefreshCw size={20} className={syncStatus === 'success' ? 'text-green-500' : ''} />
              </button>
            </div>

            {/* Sync Test Status */}
            {syncStatus !== 'idle' && (
              <div className={`p-4 rounded-lg border ${getSyncStatusColor()}`}>
                <p className="text-sm font-medium">
                  {syncStatus === 'success' ? '✓ Sync Successful' : '✗ Sync Failed'}
                </p>
                {syncStatus === 'success' && (
                  <p className="text-xs mt-1">Device is properly configured and receiving data</p>
                )}
                {syncStatus === 'error' && (
                  <p className="text-xs mt-1">Check if device ID is correct and device is online</p>
                )}
              </div>
            )}

            {/* ESP32 Configuration Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <h3 className="font-medium text-blue-900">ESP32 Configuration</h3>
              <p className="text-sm text-blue-700">
                Use this endpoint in your ESP32 code:
              </p>
              <div className="bg-white p-3 rounded border border-blue-200">
                <code className="text-xs break-all">
                  GET /api/device-sync?device_id={device.deviceId}
                </code>
              </div>
              
              <h4 className="font-medium text-blue-900 mt-4">Example Arduino Code:</h4>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* deviceId = "${device.deviceId}";
const char* serverUrl = "http://YOUR_SERVER_IP:3000";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(serverUrl) + "/api/device-sync?device_id=" + deviceId;
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      Serial.println("Sync successful:");
      Serial.println(payload);
      
      // Parse JSON and update OLED display
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);
      
      JsonArray tasks = doc["tasks"];
      for (JsonObject task : tasks) {
        Serial.print("- ");
        Serial.println(task["title"].as<String>());
      }
    } else {
      Serial.print("Sync failed with code: ");
      Serial.println(httpCode);
    }
    
    http.end();
  }
  
  delay(30000); // Poll every 30 seconds
}`}
              </pre>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <Smartphone className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-4">No device connected</p>
              <p className="text-sm text-gray-400 mt-1">
                Pair your ESP32 device to start syncing
              </p>
            </div>

            <form onSubmit={pairDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter device code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For testing, any code will generate a new device ID
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Pairing...' : 'Pair Device'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}