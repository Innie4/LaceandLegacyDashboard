import React, { useState, useEffect } from 'react';
import { ClockIcon, CurrencyDollarIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settingsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

// Minimal local type definitions for mock frontend
interface StoreSettings {
  name: string;
  description: string;
  contact: { email: string; phone: string; address: string };
  businessHours: { [key: string]: { open: string; close: string; closed: boolean } };
  timezone: string;
  currency: { code: string; symbol: string; position: 'before' | 'after'; decimalPlaces: number };
  tax: { enabled: boolean; rate: number; displayInclusive: boolean };
  shipping: { zones: ShippingZone[]; methods: ShippingMethod[] };
  payment: { gateways: PaymentGateway[]; defaultGateway: string };
}

interface ShippingZone { id: string; name: string; countries: string[]; }
interface ShippingMethod { id: string; name: string; price: number; estimatedDays: string; }
interface PaymentGateway { id: string; name: string; type: string; enabled: boolean; }

const StoreSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getStoreSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch settings');
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (!settings) return;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings((prev: StoreSettings | null) => {
        if (!prev) return null;
        const parentObj = prev[parent as keyof StoreSettings];
        if (typeof parentObj !== 'object' || parentObj === null) return prev;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setSettings((prev: StoreSettings | null) => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSaveSettings = async () => {
    // No backend, just show success
    toast.success('Settings saved successfully (mock)');
  };

  const handleBusinessHoursChange = (day: string, field: string, value: string | boolean) => {
    if (!settings) return;
    setSettings((prev: StoreSettings | null) => prev ? {
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    } : null);
  };

  const handleShippingZoneSave = async (zone: Partial<ShippingZone>) => {
    // No backend, just show success
    toast.success('Shipping zone saved successfully (mock)');
    setShowShippingModal(false);
  };

  const handleShippingMethodSave = async (method: Partial<ShippingMethod>) => {
    // No backend, just show success
    toast.success('Shipping method saved successfully (mock)');
    setShowShippingModal(false);
  };

  const handlePaymentGatewaySave = async (gateway: Partial<PaymentGateway>) => {
    if (!selectedGateway) return;
    // No backend, just show success
    toast.success('Payment gateway updated successfully (mock)');
    setShowPaymentModal(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!settings) {
    return <div>No settings found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Store Settings</h1>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Store Information</h2>
          <div className="space-y-4">
            <Input
              label="Store Name"
              value={settings.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <Input
              label="Description"
              value={settings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            <Input
              label="Contact Email"
              value={settings.contact.email}
              onChange={(e) => handleInputChange('contact.email', e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={settings.contact.phone}
              onChange={(e) => handleInputChange('contact.phone', e.target.value)}
            />
            <Input
              label="Address"
              value={settings.contact.address}
              onChange={(e) => handleInputChange('contact.address', e.target.value)}
            />
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Business Hours</h2>
          <div className="space-y-4">
            <Select
              label="Timezone"
              value={settings.timezone}
              onChange={(value) => handleInputChange('timezone', value)}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'EST', label: 'Eastern Time' },
                { value: 'CST', label: 'Central Time' },
                { value: 'PST', label: 'Pacific Time' }
              ]}
            />
            {Object.entries(settings.businessHours).map(([day, hours]) => {
              const h = hours as { open: string; close: string; closed: boolean };
              return (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                  </div>
                  <Input
                    type="time"
                    value={h.open}
                    onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                    disabled={h.closed}
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={h.close}
                    onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                    disabled={h.closed}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                      className="mr-2"
                    />
                    Closed
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Currency & Tax</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Currency Code"
                value={settings.currency.code}
                onChange={(e) => handleInputChange('currency.code', e.target.value)}
              />
              <Input
                label="Currency Symbol"
                value={settings.currency.symbol}
                onChange={(e) => handleInputChange('currency.symbol', e.target.value)}
              />
            </div>
            <Select
              label="Symbol Position"
              value={settings.currency.position}
              onChange={(value) => handleInputChange('currency.position', value)}
              options={[
                { value: 'before', label: 'Before Amount' },
                { value: 'after', label: 'After Amount' }
              ]}
            />
            <Input
              label="Decimal Places"
              type="number"
              value={settings.currency.decimalPlaces}
              onChange={(e) => handleInputChange('currency.decimalPlaces', parseInt(e.target.value))}
            />
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.tax.enabled}
                  onChange={(e) => handleInputChange('tax.enabled', e.target.checked)}
                  className="mr-2"
                />
                Enable Tax
              </label>
              <Input
                label="Tax Rate (%)"
                type="number"
                value={settings.tax.rate}
                onChange={(e) => handleInputChange('tax.rate', parseFloat(e.target.value))}
                disabled={!settings.tax.enabled}
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.tax.displayInclusive}
                  onChange={(e) => handleInputChange('tax.displayInclusive', e.target.checked)}
                  className="mr-2"
                  disabled={!settings.tax.enabled}
                />
                Display Prices Including Tax
              </label>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Shipping & Payment</h2>
          <div className="space-y-4">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedZone(null);
                setShowShippingModal(true);
              }}
              className="w-full"
            >
              <TruckIcon className="w-5 h-5 mr-2" />
              Manage Shipping
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedGateway(null);
                setShowPaymentModal(true);
              }}
              className="w-full"
            >
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Manage Payment Gateways
            </Button>
          </div>
        </div>
      </div>

      {/* Shipping Modal */}
      <Modal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        title="Shipping Management"
        size="lg"
      >
        <div className="space-y-6">
          {/* Shipping Zones */}
          <div>
            <h3 className="text-lg font-medium mb-4">Shipping Zones</h3>
            <div className="space-y-4">
              {settings.shipping.zones.map((zone: ShippingZone) => (
                <div key={zone.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{zone.name}</h4>
                      <p className="text-sm text-gray-600">
                        {zone.countries.join(', ')}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowShippingModal(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedZone(null);
                  setSelectedMethod(null);
                }}
              >
                Add Zone
              </Button>
            </div>
          </div>

          {/* Shipping Methods */}
          <div>
            <h3 className="text-lg font-medium mb-4">Shipping Methods</h3>
            <div className="space-y-4">
              {settings.shipping.methods.map((method: ShippingMethod) => (
                <div key={method.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-600">
                        ${method.price} - {method.estimatedDays}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedMethod(method);
                        setSelectedZone(null);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedMethod(null);
                  setSelectedZone(null);
                }}
              >
                Add Method
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Gateways"
      >
        <div className="space-y-4">
          {settings.payment.gateways.map((gateway: PaymentGateway) => (
            <div key={gateway.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{gateway.name}</h4>
                  <p className="text-sm text-gray-600">
                    {gateway.type} - {gateway.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedGateway(gateway);
                    setShowPaymentModal(true);
                  }}
                >
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default StoreSettingsPage; 