import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DataTable, Column } from '../../components/common/DataTable';
import marketingService, { Promotion } from '../../services/marketingService';
import Layout from '../../components/common/Layout';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

interface SelectEvent {
  target: {
    value: string;
  };
}

const Promotions: React.FC = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<{
    status?: Promotion['status'];
    type?: Promotion['type'];
    search?: string;
  }>({});

  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '',
    type: 'percentage',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    restrictions: {
      categories: [],
      products: [],
      customerGroups: []
    }
  });

  useEffect(() => {
    fetchPromotions();
  }, [filters]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getPromotions();
      setPromotions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch promotions');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string | { target: { value: string } }) => {
    const actualValue = typeof value === 'string' ? value : value.target.value;
    setFilters(prev => ({ ...prev, [field]: actualValue }));
  };

  const handleInputChange = (field: keyof Promotion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = async () => {
    try {
      const code = await marketingService.generatePromoCode();
      setFormData(prev => ({ ...prev, code }));
    } catch (err) {
      toast.error('Failed to generate promo code');
    }
  };

  const handleCreatePromotion = async () => {
    try {
      await marketingService.createPromotion(formData);
      toast.success('Promotion created successfully');
      setShowCreateModal(false);
      fetchPromotions();
    } catch (err) {
      toast.error('Failed to create promotion');
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return;
    try {
      await marketingService.updatePromotion(selectedPromotion.id, formData);
      toast.success('Promotion updated successfully');
      setShowEditModal(false);
      fetchPromotions();
    } catch (err) {
      toast.error('Failed to update promotion');
    }
  };

  const handleDeletePromotion = async (promotion: Promotion) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await marketingService.deletePromotion(promotion.id);
        toast.success('Promotion deleted successfully');
        fetchPromotions();
      } catch (err) {
        toast.error('Failed to delete promotion');
      }
    }
  };

  const handleViewStats = async (promotion: Promotion) => {
    try {
      const stats = await marketingService.getPromotionStats(promotion.id);
      setStats(stats);
      setSelectedPromotion(promotion);
      setShowStatsModal(true);
    } catch (err) {
      toast.error('Failed to fetch promotion stats');
    }
  };

  const columns: Column<Promotion>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (item: Promotion) => (
        <div className="font-mono">{item.code}</div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item: Promotion) => (
        <span className="capitalize">
          {item.type === 'percentage' ? `${item.value}%` : `$${item.value}`}
        </span>
      )
    },
    {
      key: 'validity',
      header: 'Validity',
      sortable: true,
      render: (item: Promotion) => (
        <div className="text-sm">
          <div>From: {format(new Date(item.startDate), 'MMM d, yyyy')}</div>
          <div>To: {format(new Date(item.endDate), 'MMM d, yyyy')}</div>
        </div>
      )
    },
    {
      key: 'usage',
      header: 'Usage',
      sortable: true,
      render: (item: Promotion) => (
        <div className="text-sm">
          <div>{item.usageCount} / {item.usageLimit || '∞'}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: Promotion) => (
        <span className={`px-2 py-1 text-xs rounded ${
          item.status === 'active' ? 'bg-green-100 text-green-800' :
          item.status === 'expired' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (item: Promotion) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewStats(item)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSelectedPromotion(item);
              setFormData(item);
            }}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeletePromotion(item)}
            className="p-1 text-red-600 hover:text-red-900"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Promotions</h1>
          <button
            onClick={() => navigate('/marketing/promotions/new')}
            className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
          >
            New Promotion
          </button>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search promotions"
              />
              <Select
                label="Status"
                value={filters.status}
                onChange={(value: string | SelectEvent) => handleFilterChange('status', value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'expired', label: 'Expired' }
                ]}
              />
              <Select
                label="Type"
                value={filters.type}
                onChange={(value: string | SelectEvent) => handleFilterChange('type', value)}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'fixed', label: 'Fixed Amount' },
                  { value: 'free_shipping', label: 'Free Shipping' }
                ]}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <DataTable<Promotion>
              columns={columns}
              data={promotions}
              keyExtractor={(item) => item.id}
              isLoading={loading}
            />
          </div>

          {/* Create/Edit Modal */}
          <Modal
            isOpen={showCreateModal || showEditModal}
            onClose={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
            title={showCreateModal ? 'Create Promotion' : 'Edit Promotion'}
          >
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  label="Promo Code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleGenerateCode}
                  className="mt-6"
                >
                  Generate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Discount Type"
                  value={formData.type}
                  onChange={(value) => handleInputChange('type', value)}
                  options={[
                    { value: 'percentage', label: 'Percentage' },
                    { value: 'fixed', label: 'Fixed Amount' }
                  ]}
                />
                <Input
                  label="Value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Purchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => handleInputChange('minPurchase', parseFloat(e.target.value))}
                />
                <Input
                  label="Maximum Discount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => handleInputChange('maxDiscount', parseFloat(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>

              <Input
                label="Usage Limit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value))}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={showCreateModal ? handleCreatePromotion : handleEditPromotion}
                >
                  {showCreateModal ? 'Create' : 'Save'}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Stats Modal */}
          <Modal
            isOpen={showStatsModal}
            onClose={() => setShowStatsModal(false)}
            title={`Promotion Stats - ${selectedPromotion?.code}`}
          >
            {stats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Usage</h3>
                    <p className="text-2xl font-semibold">{stats.totalUsage}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Discount</h3>
                    <p className="text-2xl font-semibold">${stats.totalDiscount.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
                    <p className="text-2xl font-semibold">${stats.averageOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                    <p className="text-2xl font-semibold">{(stats.conversionRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
};

export default Promotions; 