"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  TestTube, 
  Download, 
  Upload, 
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  CreditCard,
  Mail,
  Shield,
  Palette,
  Plug,
  Server,
  History,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    timezone: string;
    currency: string;
    language: string;
  };
  payment: {
    stripeEnabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalEnabled: boolean;
    paypalClientId: string;
    taxRate: number;
    shippingEnabled: boolean;
    freeShippingThreshold: number;
  };
  email: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    orderNotifications: boolean;
    marketingEmails: boolean;
  };
  security: {
    minPasswordLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCss: string;
  };
  api: {
    apiEnabled: boolean;
    webhookUrl: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
    apiKeys: Array<{ name: string; key: string; permissions: string[] }>;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    autoBackup: boolean;
    backupFrequency: string;
    logLevel: string;
  };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      siteName: 'My E-commerce Store',
      siteDescription: 'Your one-stop shop for everything',
      contactEmail: 'contact@mystore.com',
      contactPhone: '+1 (555) 123-4567',
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
    },
    payment: {
      stripeEnabled: true,
      stripePublicKey: 'pk_test_...',
      stripeSecretKey: '',
      paypalEnabled: false,
      paypalClientId: '',
      taxRate: 8.5,
      shippingEnabled: true,
      freeShippingThreshold: 50,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@mystore.com',
      fromName: 'My Store',
      orderNotifications: true,
      marketingEmails: false,
    },
    security: {
      minPasswordLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
      twoFactorEnabled: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3b82f6',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      customCss: '',
    },
    api: {
      apiEnabled: true,
      webhookUrl: 'https://mystore.com/webhook',
      googleAnalyticsId: '',
      facebookPixelId: '',
      apiKeys: [
        { name: 'Main API', key: 'sk_live_...', permissions: ['read', 'write'] }
      ],
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      autoBackup: true,
      backupFrequency: 'daily',
      logLevel: 'info',
    },
  });

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState<{ [key: string]: boolean }>({});
  const [auditLog, setAuditLog] = useState<Array<{ timestamp: string; user: string; action: string; section: string }>>([
    { timestamp: '2024-01-15 10:30:00', user: 'admin@mystore.com', action: 'Updated payment settings', section: 'payment' },
    { timestamp: '2024-01-14 15:45:00', user: 'admin@mystore.com', action: 'Changed site name', section: 'general' },
  ]);

  const updateSetting = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(prev => ({ ...prev, [section]: true }));
    setErrors(prev => ({ ...prev, [`${section}.${field}`]: '' }));
  };

  const validateSection = (section: keyof SettingsData) => {
    const newErrors: { [key: string]: string } = {};
    
    if (section === 'general') {
      if (!settings.general.siteName.trim()) {
        newErrors['general.siteName'] = 'Site name is required';
      }
      if (!settings.general.contactEmail.includes('@')) {
        newErrors['general.contactEmail'] = 'Valid email is required';
      }
    }
    
    if (section === 'email') {
      if (settings.email.smtpHost && !settings.email.smtpPort) {
        newErrors['email.smtpPort'] = 'SMTP port is required when host is provided';
      }
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const saveSection = async (section: keyof SettingsData) => {
    if (!validateSection(section)) return;
    
    setLoading(prev => ({ ...prev, [section]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(prev => ({ ...prev, [section]: false }));
      setAuditLog(prev => [{
        timestamp: new Date().toISOString(),
        user: 'admin@mystore.com',
        action: `Updated ${section} settings`,
        section
      }, ...prev]);
      
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  const resetSection = (section: keyof SettingsData) => {
    // Reset to default values - in real app, fetch from API
    setHasChanges(prev => ({ ...prev, [section]: false }));
    toast.info(`${section.charAt(0).toUpperCase() + section.slice(1)} settings reset`);
  };

  const testConnection = async (type: 'email' | 'payment') => {
    setLoading(prev => ({ ...prev, [`test_${type}`]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${type === 'email' ? 'Email' : 'Payment'} connection test successful`);
    } catch (error) {
      toast.error(`${type === 'email' ? 'Email' : 'Payment'} connection test failed`);
    } finally {
      setLoading(prev => ({ ...prev, [`test_${type}`]: false }));
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings-export.json';
    link.click();
  };

  const generateApiKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: [...prev.api.apiKeys, { name: 'New API Key', key: newKey, permissions: ['read'] }]
      }
    }));
    setHasChanges(prev => ({ ...prev, api: true }));
    toast.success('New API key generated');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email & Notifications', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API & Integrations', icon: Plug },
    { id: 'system', label: 'System', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Admin Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your store configuration, integrations, and system preferences
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <Button onClick={exportSettings} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Audit Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Settings Audit Log</DialogTitle>
                <DialogDescription>
                  Track all changes made to system settings
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 space-y-4 overflow-y-auto">
                {auditLog.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-sm text-gray-600">by {entry.user}</p>
                      <p className="text-xs text-gray-500">{entry.timestamp}</p>
                    </div>
                    <Badge variant="outline">{entry.section}</Badge>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 gap-4 h-auto p-1 bg-white rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {hasChanges[tab.id] && (
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic site information and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      className={errors['general.siteName'] ? 'border-red-500' : ''}
                    />
                    {errors['general.siteName'] && (
                      <p className="text-sm text-red-600">{errors['general.siteName']}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                      className={errors['general.contactEmail'] ? 'border-red-500' : ''}
                    />
                    {errors['general.contactEmail'] && (
                      <p className="text-sm text-red-600">{errors['general.contactEmail']}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={settings.general.contactPhone}
                      onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settings.general.timezone} 
                      onValueChange={(value) => updateSetting('general', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={settings.general.currency} 
                      onValueChange={(value) => updateSetting('general', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={settings.general.language} 
                      onValueChange={(value) => updateSetting('general', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('general')} 
                    disabled={loading.general}
                    className="flex items-center gap-2"
                  >
                    {loading.general ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('general')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure payment gateways, tax rates, and shipping options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Stripe Integration</h3>
                        <p className="text-sm text-gray-600">Accept credit card payments through Stripe</p>
                      </div>
                      <Switch
                        checked={settings.payment.stripeEnabled}
                        onCheckedChange={(checked) => updateSetting('payment', 'stripeEnabled', checked)}
                      />
                    </div>
                    {settings.payment.stripeEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stripePublicKey">Public Key</Label>
                          <Input
                            id="stripePublicKey"
                            value={settings.payment.stripePublicKey}
                            onChange={(e) => updateSetting('payment', 'stripePublicKey', e.target.value)}
                            placeholder="pk_..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stripeSecretKey">Secret Key</Label>
                          <Input
                            id="stripeSecretKey"
                            type="password"
                            value={settings.payment.stripeSecretKey}
                            onChange={(e) => updateSetting('payment', 'stripeSecretKey', e.target.value)}
                            placeholder="sk_..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">PayPal Integration</h3>
                        <p className="text-sm text-gray-600">Accept PayPal payments</p>
                      </div>
                      <Switch
                        checked={settings.payment.paypalEnabled}
                        onCheckedChange={(checked) => updateSetting('payment', 'paypalEnabled', checked)}
                      />
                    </div>
                    {settings.payment.paypalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                        <Input
                          id="paypalClientId"
                          value={settings.payment.paypalClientId}
                          onChange={(e) => updateSetting('payment', 'paypalClientId', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.1"
                        value={settings.payment.taxRate}
                        onChange={(e) => updateSetting('payment', 'taxRate', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Shipping</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.payment.shippingEnabled}
                          onCheckedChange={(checked) => updateSetting('payment', 'shippingEnabled', checked)}
                        />
                        <span className="text-sm">Enable shipping</span>
                      </div>
                    </div>

                    {settings.payment.shippingEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                        <Input
                          id="freeShippingThreshold"
                          type="number"
                          value={settings.payment.freeShippingThreshold}
                          onChange={(e) => updateSetting('payment', 'freeShippingThreshold', parseFloat(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('payment')} 
                    disabled={loading.payment}
                    className="flex items-center gap-2"
                  >
                    {loading.payment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('payment')}
                    disabled={loading.test_payment}
                    className="flex items-center gap-2"
                  >
                    {loading.test_payment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test Connection
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('payment')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email & Notifications */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email & Notifications
                </CardTitle>
                <CardDescription>
                  Configure SMTP settings and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">SMTP Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', e.target.value)}
                        className={errors['email.smtpPort'] ? 'border-red-500' : ''}
                      />
                      {errors['email.smtpPort'] && (
                        <p className="text-sm text-red-600">{errors['email.smtpPort']}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Notifications</p>
                        <p className="text-sm text-gray-600">Send email notifications for new orders</p>
                      </div>
                      <Switch
                        checked={settings.email.orderNotifications}
                        onCheckedChange={(checked) => updateSetting('email', 'orderNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-600">Send promotional emails to customers</p>
                      </div>
                      <Switch
                        checked={settings.email.marketingEmails}
                        onCheckedChange={(checked) => updateSetting('email', 'marketingEmails', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('email')} 
                    disabled={loading.email}
                    className="flex items-center gap-2"
                  >
                    {loading.email ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => testConnection('email')}
                    disabled={loading.test_email}
                    className="flex items-center gap-2"
                  >
                    {loading.test_email ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test Email
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('email')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure password policies, two-factor authentication, and session management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Password Policy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                      <Input
                        id="minPasswordLength"
                        type="number"
                        min="6"
                        max="50"
                        value={settings.security.minPasswordLength}
                        onChange={(e) => updateSetting('security', 'minPasswordLength', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Require uppercase letters</span>
                        <Switch
                          checked={settings.security.requireUppercase}
                          onCheckedChange={(checked) => updateSetting('security', 'requireUppercase', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Require numbers</span>
                        <Switch
                          checked={settings.security.requireNumbers}
                          onCheckedChange={(checked) => updateSetting('security', 'requireNumbers', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Require symbols</span>
                        <Switch
                          checked={settings.security.requireSymbols}
                          onCheckedChange={(checked) => updateSetting('security', 'requireSymbols', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Require two-factor authentication for admin accounts</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                    />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-4">Session Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        max="1440"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        min="3"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('security')} 
                    disabled={loading.security}
                    className="flex items-center gap-2"
                  >
                    {loading.security ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('security')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-600" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize your store's visual appearance and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select 
                        value={settings.appearance.theme} 
                        onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.appearance.primaryColor}
                          onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={settings.appearance.logoUrl}
                        onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">Favicon URL</Label>
                      <Input
                        id="faviconUrl"
                        value={settings.appearance.faviconUrl}
                        onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customCss">Custom CSS</Label>
                      <Textarea
                        id="customCss"
                        value={settings.appearance.customCss}
                        onChange={(e) => updateSetting('appearance', 'customCss', e.target.value)}
                        rows={6}
                        placeholder="/* Custom styles */"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 bg-gray-50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Live Preview
                    </h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        {settings.appearance.logoUrl && (
                          <img 
                            src={settings.appearance.logoUrl} 
                            alt="Logo" 
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <h4 className="font-bold text-lg">{settings.general.siteName}</h4>
                      </div>
                      <div 
                        className="h-4 w-full rounded mb-3"
                        style={{ backgroundColor: settings.appearance.primaryColor }}
                      />
                      <p className="text-sm text-gray-600 mb-3">{settings.general.siteDescription}</p>
                      <button 
                        className="px-4 py-2 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: settings.appearance.primaryColor }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('appearance')} 
                    disabled={loading.appearance}
                    className="flex items-center gap-2"
                  >
                    {loading.appearance ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('appearance')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Integrations */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-blue-600" />
                  API & Integrations
                </CardTitle>
                <CardDescription>
                  Manage API access, webhooks, and third-party service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">API Access</h3>
                      <p className="text-sm text-gray-600">Enable API access for your store</p>
                    </div>
                    <Switch
                      checked={settings.api.apiEnabled}
                      onCheckedChange={(checked) => updateSetting('api', 'apiEnabled', checked)}
                    />
                  </div>

                  {settings.api.apiEnabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">API Keys</h4>
                        <Button onClick={generateApiKey} size="sm" className="flex items-center gap-2">
                          <Plug className="h-4 w-4" />
                          Generate New Key
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {settings.api.apiKeys.map((key, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{key.name}</p>
                              <p className="text-sm text-gray-600 font-mono">{key.key}</p>
                              <div className="flex gap-1 mt-1">
                                {key.permissions.map((perm, permIndex) => (
                                  <Badge key={permIndex} variant="outline" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={settings.api.webhookUrl}
                      onChange={(e) => updateSetting('api', 'webhookUrl', e.target.value)}
                      placeholder="https://yoursite.com/webhook"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                    <Input
                      id="googleAnalyticsId"
                      value={settings.api.googleAnalyticsId}
                      onChange={(e) => updateSetting('api', 'googleAnalyticsId', e.target.value)}
                      placeholder="GA-XXXXXXXXX-X"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                    <Input
                      id="facebookPixelId"
                      value={settings.api.facebookPixelId}
                      onChange={(e) => updateSetting('api', 'facebookPixelId', e.target.value)}
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('api')} 
                    disabled={loading.api}
                    className="flex items-center gap-2"
                  >
                    {loading.api ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('api')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system maintenance, backups, and logging preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-orange-700">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600">Put your store in maintenance mode</p>
                      </div>
                      <Switch
                        checked={settings.system.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                      />
                    </div>
                    {settings.system.maintenanceMode && (
                      <Alert className="mt-3">
                        <AlertDescription>
                          Your store is currently in maintenance mode. Customers will see a maintenance page.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Debug Mode</h3>
                        <p className="text-sm text-gray-600">Enable detailed error logging</p>
                      </div>
                      <Switch
                        checked={settings.system.debugMode}
                        onCheckedChange={(checked) => updateSetting('system', 'debugMode', checked)}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Automatic Backups</h3>
                        <p className="text-sm text-gray-600">Schedule automatic database backups</p>
                      </div>
                      <Switch
                        checked={settings.system.autoBackup}
                        onCheckedChange={(checked) => updateSetting('system', 'autoBackup', checked)}
                      />
                    </div>
                    {settings.system.autoBackup && (
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select 
                          value={settings.system.backupFrequency} 
                          onValueChange={(value) => updateSetting('system', 'backupFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select 
                      value={settings.system.logLevel} 
                      onValueChange={(value) => updateSetting('system', 'logLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => saveSection('system')} 
                    disabled={loading.system}
                    className="flex items-center gap-2"
                  >
                    {loading.system ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => resetSection('system')}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}