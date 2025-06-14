import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DataTable, Column } from '../../components/common/DataTable';
import marketingService, { EmailCampaign } from '../../services/marketingService';
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

const EmailCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<{
    status?: EmailCampaign['status'];
    type?: string;
    search?: string;
  }>({});

  const [formData, setFormData] = useState<Partial<EmailCampaign>>({
    name: '',
    subject: '',
    content: '',
    template: '',
    status: 'draft',
    scheduleDate: '',
    segment: {
      type: 'all',
      filters: {}
    }
  });

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await marketingService.getCampaigns();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | SelectEvent) => {
    if (typeof value === 'string') {
      setFilters(prev => ({ ...prev, [key]: value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value.target.value }));
    }
  };

  const handleInputChange = (field: keyof EmailCampaign, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleViewStats = async (campaign: EmailCampaign) => {
    try {
      const stats = await marketingService.getCampaignStats(campaign.id);
      setStats(stats);
    } catch (err) {
      toast.error('Failed to fetch campaign stats');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await marketingService.deleteCampaign(id);
      await fetchCampaigns();
      toast.success('Campaign deleted successfully');
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  const columns: Column<EmailCampaign>[] = [
    {
      key: 'name',
      header: 'Campaign Name',
      sortable: true,
      render: (item: EmailCampaign) => (
        <button
          onClick={() => navigate(`/marketing/campaigns/${item.id}`)}
          className="text-vintage-600 hover:text-vintage-700"
        >
          {item.name}
        </button>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: EmailCampaign) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === 'sent'
              ? 'bg-green-100 text-green-800'
              : item.status === 'scheduled'
              ? 'bg-blue-100 text-blue-800'
              : item.status === 'sending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      )
    },
    {
      key: 'scheduleDate',
      header: 'Schedule Date',
      sortable: true,
      render: (item: EmailCampaign) => (
        <span>
          {item.scheduleDate ? format(new Date(item.scheduleDate), 'MMM d, yyyy') : 'Not scheduled'}
        </span>
      )
    },
    {
      key: 'stats',
      header: 'Stats',
      sortable: true,
      render: (item: EmailCampaign) => (
        <div className="text-sm">
          <div>Sent: {item.stats.sent}</div>
          <div>Opened: {item.stats.opened}</div>
          <div>Clicked: {item.stats.clicked}</div>
          <div>Converted: {item.stats.converted}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (item: EmailCampaign) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewStats(item)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSelectedCampaign(item);
              setFormData(item);
            }}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
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
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
          <button
            onClick={() => navigate('/marketing/campaigns/new')}
            className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
          >
            New Campaign
          </button>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow">
          <DataTable<EmailCampaign>
            columns={columns}
            data={campaigns}
            keyExtractor={(item) => item.id}
            isLoading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EmailCampaigns; 