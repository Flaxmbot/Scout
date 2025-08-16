import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics } from '@/db/schema';
import { eq, like } from 'drizzle-orm';

// Default settings configuration
const DEFAULT_SETTINGS = {
  // General settings
  setting_site_name: 'My Store',
  setting_site_description: 'Your online store description',
  setting_currency: 'USD',
  setting_currency_symbol: '$',
  setting_timezone: 'UTC',
  setting_language: 'en',
  
  // Payment settings
  setting_payment_methods: JSON.stringify(['credit_card', 'paypal']),
  setting_payment_gateway: 'stripe',
  setting_payment_test_mode: true,
  setting_tax_rate: 0.08,
  setting_tax_inclusive: false,
  
  // Shipping settings
  setting_shipping_enabled: true,
  setting_shipping_rate_local: 5.00,
  setting_shipping_rate_national: 10.00,
  setting_shipping_rate_international: 25.00,
  setting_free_shipping_threshold: 100.00,
  setting_shipping_calculation: 'flat_rate',
  
  // Notification settings
  setting_email_notifications: true,
  setting_sms_notifications: false,
  setting_order_notifications: true,
  setting_marketing_emails: false,
  setting_admin_email: 'admin@example.com',
  setting_notification_frequency: 'immediate',
  
  // Appearance settings
  setting_theme: 'default',
  setting_primary_color: '#3b82f6',
  setting_secondary_color: '#64748b',
  setting_logo_url: '',
  setting_favicon_url: '',
  setting_layout: 'grid'
};

// Settings validation schema
const SETTINGS_VALIDATION = {
  // General settings
  setting_site_name: { type: 'string', required: true, maxLength: 100 },
  setting_site_description: { type: 'string', maxLength: 500 },
  setting_currency: { type: 'string', required: true, enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] },
  setting_currency_symbol: { type: 'string', required: true, maxLength: 5 },
  setting_timezone: { type: 'string', required: true },
  setting_language: { type: 'string', required: true, enum: ['en', 'es', 'fr', 'de', 'it', 'pt'] },
  
  // Payment settings
  setting_payment_methods: { type: 'json', required: true },
  setting_payment_gateway: { type: 'string', required: true, enum: ['stripe', 'paypal', 'square'] },
  setting_payment_test_mode: { type: 'boolean', required: true },
  setting_tax_rate: { type: 'number', min: 0, max: 1 },
  setting_tax_inclusive: { type: 'boolean', required: true },
  
  // Shipping settings
  setting_shipping_enabled: { type: 'boolean', required: true },
  setting_shipping_rate_local: { type: 'number', min: 0 },
  setting_shipping_rate_national: { type: 'number', min: 0 },
  setting_shipping_rate_international: { type: 'number', min: 0 },
  setting_free_shipping_threshold: { type: 'number', min: 0 },
  setting_shipping_calculation: { type: 'string', enum: ['flat_rate', 'weight_based', 'zone_based'] },
  
  // Notification settings
  setting_email_notifications: { type: 'boolean', required: true },
  setting_sms_notifications: { type: 'boolean', required: true },
  setting_order_notifications: { type: 'boolean', required: true },
  setting_marketing_emails: { type: 'boolean', required: true },
  setting_admin_email: { type: 'email', required: true },
  setting_notification_frequency: { type: 'string', enum: ['immediate', 'hourly', 'daily'] },
  
  // Appearance settings
  setting_theme: { type: 'string', required: true, enum: ['default', 'dark', 'minimal', 'modern'] },
  setting_primary_color: { type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/ },
  setting_secondary_color: { type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/ },
  setting_logo_url: { type: 'string' },
  setting_favicon_url: { type: 'string' },
  setting_layout: { type: 'string', enum: ['grid', 'list', 'carousel'] }
};

function validateSetting(key: string, value: any): { valid: boolean; error?: string } {
  const validation = SETTINGS_VALIDATION[key as keyof typeof SETTINGS_VALIDATION];
  if (!validation) {
    return { valid: false, error: `Unknown setting: ${key}` };
  }

  // Required field check
  if (validation.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${key} is required` };
  }

  if (value === null || value === undefined) {
    return { valid: true };
  }

  // Type validation
  switch (validation.type) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: `${key} must be a string` };
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return { valid: false, error: `${key} must not exceed ${validation.maxLength} characters` };
      }
      if (validation.enum && !validation.enum.includes(value)) {
        return { valid: false, error: `${key} must be one of: ${validation.enum.join(', ')}` };
      }
      if (validation.pattern && !validation.pattern.test(value)) {
        return { valid: false, error: `${key} format is invalid` };
      }
      break;

    case 'number':
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        return { valid: false, error: `${key} must be a number` };
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return { valid: false, error: `${key} must be at least ${validation.min}` };
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return { valid: false, error: `${key} must not exceed ${validation.max}` };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return { valid: false, error: `${key} must be a boolean` };
      }
      break;

    case 'email':
      if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, error: `${key} must be a valid email address` };
      }
      break;

    case 'json':
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch {
          return { valid: false, error: `${key} must be valid JSON` };
        }
      } else if (typeof value !== 'object') {
        return { valid: false, error: `${key} must be JSON or object` };
      }
      break;
  }

  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    // If specific key requested
    if (key) {
      const setting = await db.select()
        .from(analytics)
        .where(eq(analytics.metricName, key))
        .limit(1);

      if (setting.length === 0) {
        // Return default value if exists
        const defaultValue = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
        if (defaultValue !== undefined) {
          return NextResponse.json({
            key,
            value: defaultValue,
            isDefault: true
          });
        }
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }

      const settingData = setting[0];
      let value: any = settingData.value;

      // Parse JSON values for specific settings
      if (key.includes('payment_methods') || key.includes('address')) {
        try {
          value = JSON.parse(value.toString());
        } catch {
          // Keep original value if parsing fails
        }
      }

      return NextResponse.json({
        key,
        value,
        updatedAt: settingData.createdAt,
        isDefault: false
      });
    }

    // Get all settings or by category
    let query = db.select().from(analytics);
    
    if (category) {
      query = query.where(like(analytics.metricName, `setting_%`));
    } else {
      query = query.where(like(analytics.metricName, `setting_%`));
    }

    const settings = await query;
    
    // Create settings object
    const settingsObject: { [key: string]: any } = {};
    const existingKeys = new Set();

    // Process existing settings
    settings.forEach(setting => {
      existingKeys.add(setting.metricName);
      let value: any = setting.value;

      // Parse JSON values for specific settings
      if (setting.metricName.includes('payment_methods') || setting.metricName.includes('address')) {
        try {
          value = JSON.parse(value.toString());
        } catch {
          // Keep original value if parsing fails
        }
      }

      settingsObject[setting.metricName] = {
        value,
        updatedAt: setting.createdAt,
        isDefault: false
      };
    });

    // Add missing default settings
    Object.entries(DEFAULT_SETTINGS).forEach(([key, defaultValue]) => {
      if (!existingKeys.has(key)) {
        // Filter by category if specified
        if (category) {
          const categoryMatch = key.startsWith(`setting_${category}_`) || 
                               (category === 'general' && !key.includes('payment_') && !key.includes('shipping_') && 
                                !key.includes('notification_') && !key.includes('email_') && !key.includes('sms_') && 
                                !key.includes('theme') && !key.includes('color') && !key.includes('logo') && 
                                !key.includes('favicon') && !key.includes('layout'));
          
          if (!categoryMatch) return;
        }

        settingsObject[key] = {
          value: defaultValue,
          updatedAt: null,
          isDefault: true
        };
      }
    });

    // Group by category if requested
    if (category) {
      const categorySettings: { [key: string]: any } = {};
      Object.entries(settingsObject).forEach(([key, data]) => {
        if (key.startsWith(`setting_${category}_`) || 
            (category === 'general' && !key.includes('payment_') && !key.includes('shipping_') && 
             !key.includes('notification_') && !key.includes('email_') && !key.includes('sms_') && 
             !key.includes('theme') && !key.includes('color') && !key.includes('logo') && 
             !key.includes('favicon') && !key.includes('layout'))) {
          categorySettings[key] = data;
        }
      });
      return NextResponse.json({ category, settings: categorySettings });
    }

    return NextResponse.json({ settings: settingsObject });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, bulk = false } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ 
        error: "Settings object is required",
        code: "MISSING_SETTINGS" 
      }, { status: 400 });
    }

    const updatedSettings: { [key: string]: any } = {};
    const errors: { [key: string]: string } = {};
    const now = new Date().toISOString();

    // Validate all settings first
    for (const [key, value] of Object.entries(settings)) {
      if (!key.startsWith('setting_')) {
        errors[key] = 'Setting key must start with "setting_"';
        continue;
      }

      const validation = validateSetting(key, value);
      if (!validation.valid) {
        errors[key] = validation.error!;
        continue;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors 
      }, { status: 400 });
    }

    // Process each setting
    for (const [key, value] of Object.entries(settings)) {
      try {
        // Convert value to appropriate format for storage
        let storageValue: any = value;
        
        // Handle boolean conversion
        if (typeof value === 'boolean') {
          storageValue = value ? 1 : 0;
        }
        // Handle object/array conversion to JSON string
        else if (typeof value === 'object' && value !== null) {
          storageValue = JSON.stringify(value);
        }
        // Handle string conversion for numbers stored as text
        else if (typeof value === 'number') {
          storageValue = value;
        }

        // Check if setting exists
        const existing = await db.select()
          .from(analytics)
          .where(eq(analytics.metricName, key))
          .limit(1);

        if (existing.length > 0) {
          // Update existing setting
          const updated = await db.update(analytics)
            .set({
              value: storageValue,
              createdAt: now
            })
            .where(eq(analytics.metricName, key))
            .returning();

          updatedSettings[key] = {
            value: value,
            updatedAt: now,
            isDefault: false,
            action: 'updated'
          };
        } else {
          // Create new setting
          const created = await db.insert(analytics)
            .values({
              metricName: key,
              value: storageValue,
              date: now.split('T')[0], // Date part only
              createdAt: now
            })
            .returning();

          updatedSettings[key] = {
            value: value,
            updatedAt: now,
            isDefault: false,
            action: 'created'
          };
        }
      } catch (settingError) {
        console.error(`Error updating setting ${key}:`, settingError);
        errors[key] = 'Failed to update setting';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        error: "Some settings failed to update",
        code: "PARTIAL_UPDATE_FAILED",
        updated: updatedSettings,
        errors 
      }, { status: 207 }); // Multi-status
    }

    return NextResponse.json({
      message: `Successfully updated ${Object.keys(updatedSettings).length} setting(s)`,
      settings: updatedSettings
    });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}