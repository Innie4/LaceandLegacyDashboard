import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import marketingService, { Promotion } from '../../services/marketingService';
import { DataTable } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    restrictions: {
      categories: [] as string[],
      products: [] as string[],
      customerGroups: [] as string[]
    }
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getPromotions();
      setPromotions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch promotions');
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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

  const columns = [
    {
      Header: 'Code',
      accessor: 'code',
      Cell: ({ row }: any) => (
        <div className="font-mono">{row.original.code}</div>
      )
    },
    {
      Header: 'Type',
      accessor: 'type',
      Cell: ({ row }: any) => (
        <span className="capitalize">
          {row.original.type === 'percentage' ? `${row.original.value}%` : `$${row.original.value}`}
        </span>
      )
    },
    {
      Header: 'Validity',
      accessor: 'validity',
      Cell: ({ row }: any) => (
        <div className="text-sm">
          <div>From: {new Date(row.original.startDate).toLocaleDateString()}</div>
          <div>To: {new Date(row.original.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      Header: 'Usage',
      accessor: 'usage',
      Cell: ({ row }: any) => (
        <div className="text-sm">
          <div>{row.original.usageCount} / {row.original.usageLimit || '∞'}</div>
        </div>
      )
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }: any) => (
        <span className={`px-2 py-1 text-xs rounded ${
          row.original.status === 'active' ? 'bg-green-100 text-green-800' :
          row.original.status === 'expired' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      )
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewStats(row.original)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSelectedPromotion(row.original);
              setFormData(row.original);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeletePromotion(row.original)}
            className="p-1 text-red-600 hover:text-red-900"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Promotions</h1>
        <Button
          variant="primary"
          onClick={() => {
            setFormData({
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
            setShowCreateModal(true);
          }}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Promotion
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={promotions}
          loading={loading}
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
              onChange={(e) => handleInputChange('type', e.target.value)}
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
  );
};

export default Promotions; 