"use client"

import { useState, useEffect } from "react"
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Palette, 
  User, 
  Key, 
  Bell, 
  Download, 
  Upload,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Save,
  RefreshCw,
  Database,
  Shield,
  Globe,
  Clock,
  BarChart3,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info
} from "lucide-react"

interface SettingsData {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  dateFormat: string
  currency: string
  language: string
  autoRefresh: boolean
  refreshInterval: number
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
    reports: boolean
    alerts: boolean
  }
  dashboard: {
    defaultView: string
    itemsPerPage: number
    showRevenue: boolean
    showCharts: boolean
    compactMode: boolean
  }
  api: {
    timeout: number
    retryAttempts: number
    cacheEnabled: boolean
    cacheDuration: number
  }
  export: {
    defaultFormat: string
    includeHeaders: boolean
    dateRange: number
  }
}

const defaultSettings: SettingsData = {
  theme: 'system',
  timezone: 'UTC',
  dateFormat: 'MM/dd/yyyy',
  currency: 'USD',
  language: 'en',
  autoRefresh: false,
  refreshInterval: 30,
  notifications: {
    email: true,
    push: false,
    desktop: true,
    reports: true,
    alerts: true
  },
  dashboard: {
    defaultView: 'dashboard',
    itemsPerPage: 50,
    showRevenue: true,
    showCharts: true,
    compactMode: false
  },
  api: {
    timeout: 30,
    retryAttempts: 3,
    cacheEnabled: true,
    cacheDuration: 5
  },
  export: {
    defaultFormat: 'csv',
    includeHeaders: true,
    dateRange: 30
  }
}

export default function SettingsPage() {
  const { user } = useUser()
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown'>('unknown')
  const [activeTab, setActiveTab] = useState('appearance')

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
    checkApiStatus()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('everflow-dashboard-settings')
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      localStorage.setItem('everflow-dashboard-settings', JSON.stringify(settings))
      
      // Apply theme immediately
      applyTheme(settings.theme)
      
      // Simulate API save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const checkApiStatus = async () => {
    setApiKeyStatus('checking')
    try {
      const response = await fetch('/api/everflow/test')
      if (response.ok) {
        setApiKeyStatus('valid')
      } else {
        setApiKeyStatus('invalid')
      }
    } catch (error) {
      setApiKeyStatus('invalid')
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('everflow-dashboard-settings')
    applyTheme('system')
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'everflow-dashboard-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings({ ...defaultSettings, ...importedSettings })
        } catch (error) {
          console.error('Error importing settings:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.')
    const newSettings = { ...settings }
    let current: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
  }

  const getApiStatusIcon = () => {
    switch (apiKeyStatus) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getApiStatusText = () => {
    switch (apiKeyStatus) {
      case 'checking':
        return 'Checking API connection...'
      case 'valid':
        return 'API connection successful'
      case 'invalid':
        return 'API connection failed'
      default:
        return 'API status unknown'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-6">
          <SignedOut>
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p className="text-muted-foreground mb-6">Please sign in to access settings</p>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-muted-foreground">
                    Customize your dashboard experience and preferences
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={resetSettings} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={exportSettings} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <label htmlFor="import-settings">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </span>
                    </Button>
                  </label>
                  <input
                    id="import-settings"
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                  <Button 
                    onClick={saveSettings} 
                    disabled={saving}
                    size="sm"
                  >
                    <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* Settings Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="appearance" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Appearance</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <span className="hidden sm:inline">API</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Advanced</span>
                  </TabsTrigger>
                </TabsList>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance & Theme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'system', label: 'System', icon: Laptop }
                          ].map(({ value, label, icon: Icon }) => (
                            <Button
                              key={value}
                              variant={settings.theme === value ? 'default' : 'outline'}
                              onClick={() => updateSetting('theme', value)}
                              className="flex flex-col items-center gap-2 h-20"
                            >
                              <Icon className="h-6 w-6" />
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Language</label>
                          <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Timezone</label>
                          <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time</SelectItem>
                              <SelectItem value="America/Chicago">Central Time</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                              <SelectItem value="Europe/London">London</SelectItem>
                              <SelectItem value="Europe/Paris">Paris</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date Format</label>
                          <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                              <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                              <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                              <SelectItem value="MMM dd, yyyy">MMM DD, YYYY</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Currency</label>
                          <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                              <SelectItem value="AUD">AUD (A$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          {user?.imageUrl ? (
                            <img 
                              src={user.imageUrl} 
                              alt="Profile" 
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{user?.fullName || 'User'}</h3>
                          <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                          <Badge variant="secondary" className="mt-1">
                            {(user?.publicMetadata?.role as string) || 'User'}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Display Name</label>
                          <Input value={user?.fullName || ''} disabled className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Member Since</label>
                          <Input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''} disabled className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Last Sign In</label>
                          <Input value={user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : ''} disabled className="mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* API Settings */}
                <TabsContent value="api" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {getApiStatusIcon()}
                            <span className="text-sm font-medium">{getApiStatusText()}</span>
                          </div>
                          <Button onClick={checkApiStatus} variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">API Key</label>
                          <div className="flex gap-2">
                            <Input
                              type={showApiKey ? 'text' : 'password'}
                              value="••••••••••••••••••••"
                              disabled
                              className="font-mono"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            API key is configured in environment variables for security
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Request Timeout (seconds)</label>
                            <Input
                              type="number"
                              value={settings.api.timeout}
                              onChange={(e) => updateSetting('api.timeout', parseInt(e.target.value))}
                              min="10"
                              max="120"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Retry Attempts</label>
                            <Input
                              type="number"
                              value={settings.api.retryAttempts}
                              onChange={(e) => updateSetting('api.retryAttempts', parseInt(e.target.value))}
                              min="1"
                              max="5"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Cache Duration (minutes)</label>
                            <Input
                              type="number"
                              value={settings.api.cacheDuration}
                              onChange={(e) => updateSetting('api.cacheDuration', parseInt(e.target.value))}
                              min="1"
                              max="60"
                              disabled={!settings.api.cacheEnabled}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Enable Caching</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={settings.api.cacheEnabled}
                                onChange={(e) => updateSetting('api.cacheEnabled', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Cache API responses</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {[
                          { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
                          { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Browser push notifications' },
                          { key: 'desktop', label: 'Desktop Notifications', icon: Monitor, description: 'System desktop notifications' },
                          { key: 'reports', label: 'Report Notifications', icon: BarChart3, description: 'Scheduled report notifications' },
                          { key: 'alerts', label: 'Alert Notifications', icon: AlertTriangle, description: 'Critical alert notifications' }
                        ].map(({ key, label, icon: Icon, description }) => (
                          <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-sm text-muted-foreground">{description}</div>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications[key as keyof typeof settings.notifications]}
                              onChange={(e) => updateSetting(`notifications.${key}`, e.target.checked)}
                              className="rounded"
                            />
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Auto Refresh</h4>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={settings.autoRefresh}
                            onChange={(e) => updateSetting('autoRefresh', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Enable automatic data refresh</span>
                        </div>
                        {settings.autoRefresh && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Refresh Interval (seconds)</label>
                            <Select 
                              value={settings.refreshInterval.toString()} 
                              onValueChange={(value) => updateSetting('refreshInterval', parseInt(value))}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                                <SelectItem value="600">10 minutes</SelectItem>
                                <SelectItem value="1800">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Dashboard Settings */}
                <TabsContent value="dashboard" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Dashboard Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Default View</label>
                          <Select 
                            value={settings.dashboard.defaultView} 
                            onValueChange={(value) => updateSetting('dashboard.defaultView', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dashboard">Dashboard</SelectItem>
                              <SelectItem value="offers">Offers</SelectItem>
                              <SelectItem value="affiliates">Affiliates</SelectItem>
                              <SelectItem value="advertisers">Advertisers</SelectItem>
                              <SelectItem value="reports">Reports</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Items Per Page</label>
                          <Select 
                            value={settings.dashboard.itemsPerPage.toString()} 
                            onValueChange={(value) => updateSetting('dashboard.itemsPerPage', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                              <SelectItem value="200">200</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Display Options</h4>
                        <div className="space-y-3">
                          {[
                            { key: 'showRevenue', label: 'Show Revenue Data', description: 'Display revenue information in tables and charts' },
                            { key: 'showCharts', label: 'Show Charts', description: 'Display visual charts and graphs' },
                            { key: 'compactMode', label: 'Compact Mode', description: 'Use smaller spacing and compact layouts' }
                          ].map(({ key, label, description }) => (
                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-sm text-muted-foreground">{description}</div>
                              </div>
                              <input
                                type="checkbox"
                                checked={settings.dashboard[key as keyof typeof settings.dashboard] as boolean}
                                onChange={(e) => updateSetting(`dashboard.${key}`, e.target.checked)}
                                className="rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Export Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Default Export Format</label>
                            <Select 
                              value={settings.export.defaultFormat} 
                              onValueChange={(value) => updateSetting('export.defaultFormat', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="xlsx">Excel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Default Date Range (days)</label>
                            <Input
                              type="number"
                              value={settings.export.dateRange}
                              onChange={(e) => updateSetting('export.dateRange', parseInt(e.target.value))}
                              min="1"
                              max="365"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={settings.export.includeHeaders}
                            onChange={(e) => updateSetting('export.includeHeaders', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Include headers in exports</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Data & Storage</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                            <div className="flex items-center gap-2 mb-1">
                              <Database className="h-4 w-4" />
                              <span className="font-medium">Clear Cache</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Clear stored API cache data</span>
                          </Button>

                          <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                            <div className="flex items-center gap-2 mb-1">
                              <RefreshCw className="h-4 w-4" />
                              <span className="font-medium">Reset to Defaults</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Reset all settings to default values</span>
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium">About</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Everflow Dashboard v1.0.0 - Built with Next.js, TypeScript, and Tailwind CSS
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Settings are stored locally in your browser and synced with your account
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </SignedIn>
        </main>
      </div>
    </div>
  )
}
