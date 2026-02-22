/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/device/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Link2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Device {
  id: string
  deviceCode: string
  mode: string
  lastSync: string | null
}

export default function DevicePage() {
  const [device, setDevice] = useState<Device | null>(null)
  const [deviceCode, setDeviceCode] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (!device) return

    try {
      const res = await fetch(`/api/device-sync?device_id=${device.deviceCode}`)
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Sync test successful!')
        console.log('Sync data:', data)
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      toast.error('Sync test failed')
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
                  <p className="text-sm text-gray-500">Device ID: {device.deviceCode}</p>
                  {device.lastSync && (
                    <p className="text-xs text-gray-400">
                      Last sync: {new Date(device.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={testSync}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">ESP32 API Endpoint:</p>
              <code className="text-xs bg-white px-2 py-1 rounded mt-2 block">
                GET /api/device-sync?device_id={device.deviceCode}
              </code>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <Smartphone className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-4">No device connected</p>
            </div>

            <form onSubmit={pairDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter device code (simulated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                />
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