import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import marketingService, { EmailCampaign, EmailTemplate, CustomerSegment } from '../../services/marketingService';
import { DataTable } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EmailCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template: '',
    status: 'draft' as 'draft' | 'scheduled' | 'sending' | 'sent',
    scheduleDate: '',
    segment: {
      type: 'all' as 'all' | 'filtered',
      filters: {} as Record<string, any>
    },
    abTest: {
      enabled: false,
      variantA: {
        subject: '',
        content: ''
      },
      variantB: {
        subject: '',
        content: ''
      }
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignsData, templatesData, segmentsData] = await Promise.all([
        marketingService.getCampaigns(),
        marketingService.getTemplates(),
        marketingService.getSegments()
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
      setSegments(segmentsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      toast.error('Failed to fetch data');
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

  const handleCreateCampaign = async () => {
    try {
      await marketingService.createCampaign(formData);
      toast.success('Campaign created successfully');
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  const handleEditCampaign = async () => {
    if (!selectedCampaign) return;
    try {
      await marketingService.updateCampaign(selectedCampaign.id, formData);
      toast.success('Campaign updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (campaign: EmailCampaign) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await marketingService.deleteCampaign(campaign.id);
        toast.success('Campaign deleted successfully');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    try {
      await marketingService.sendCampaign(campaign.id);
      toast.success('Campaign sent successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to send campaign');
    }
  };

  const handleViewStats = async (campaign: EmailCampaign) => {
    try {
      const stats = await marketingService.getCampaignStats(campaign.id);
      setStats(stats);
      setSelectedCampaign(campaign);
      setShowStatsModal(true);
    } catch (err) {
      toast.error('Failed to fetch campaign stats');
    }
  };

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
          <span>{row.original.name}</span>
        </div>
      )
    },
    {
      Header: 'Subject',
      accessor: 'subject',
      Cell: ({ row }: any) => (
        <div className="text-sm text-gray-600">{row.original.subject}</div>
      )
    },
    {
      Header: 'Segment',
      accessor: 'segment',
      Cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.segment.type === 'all' ? 'All Customers' : 'Filtered Segment'}
        </div>
      )
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }: any) => (
        <span className={`px-2 py-1 text-xs rounded ${
          row.original.status === 'sent' ? 'bg-green-100 text-green-800' :
          row.original.status === 'sending' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      )
    },
    {
      Header: 'Stats',
      accessor: 'stats',
      Cell: ({ row }: any) => (
        <div className="text-sm">
          <div>Sent: {row.original.stats.sent}</div>
          <div>Opened: {row.original.stats.opened}</div>
          <div>Clicked: {row.original.stats.clicked}</div>
        </div>
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
              setSelectedCampaign(row.original);
              setFormData(row.original);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteCampaign(row.original)}
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
        <h1 className="text-2xl font-semibold text-gray-900">Email Campaigns</h1>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowTemplateModal(true)}
          >
            Templates
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowSegmentModal(true)}
          >
            Segments
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setFormData({
                name: '',
                subject: '',
                content: '',
                template: '',
                status: 'draft',
                scheduleDate: '',
                segment: {
                  type: 'all',
                  filters: {}
                },
                abTest: {
                  enabled: false,
                  variantA: {
                    subject: '',
                    content: ''
                  },
                  variantB: {
                    subject: '',
                    content: ''
                  }
                }
              });
              setShowCreateModal(true);
            }}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={campaigns}
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
        title={showCreateModal ? 'Create Campaign' : 'Edit Campaign'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Template"
              value={formData.template}
              onChange={(e) => handleInputChange('template', e.target.value)}
              options={[
                { value: '', label: 'Select Template' },
                ...templates.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'sending', label: 'Sending' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
            {formData.status === 'scheduled' && (
              <Input
                label="Schedule Date"
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <ReactQuill
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              className="h-64 mb-12"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">A/B Testing</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.abTest.enabled}
                  onChange={(e) => handleInputChange('abTest.enabled', e.target.checked)}
                  className="mr-2"
                />
                Enable A/B Testing
              </label>
            </div>

            {formData.abTest.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Variant A</h4>
                  <Input
                    label="Subject"
                    value={formData.abTest.variantA.subject}
                    onChange={(e) => handleInputChange('abTest.variantA.subject', e.target.value)}
                  />
                  <ReactQuill
                    value={formData.abTest.variantA.content}
                    onChange={(content) => handleInputChange('abTest.variantA.content', content)}
                    className="h-48 mb-12"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Variant B</h4>
                  <Input
                    label="Subject"
                    value={formData.abTest.variantB.subject}
                    onChange={(e) => handleInputChange('abTest.variantB.subject', e.target.value)}
                  />
                  <ReactQuill
                    value={formData.abTest.variantB.content}
                    onChange={(content) => handleInputChange('abTest.variantB.content', content)}
                    className="h-48 mb-12"
                  />
                </div>
              </div>
            )}
          </div>

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
              onClick={showCreateModal ? handleCreateCampaign : handleEditCampaign}
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
        title={`Campaign Stats - ${selectedCampaign?.name}`}
      >
        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Sent</h3>
                <p className="text-2xl font-semibold">{stats.sent}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Opened</h3>
                <p className="text-2xl font-semibold">{stats.opened}</p>
                <p className="text-sm text-gray-500">({(stats.openRate * 100).toFixed(1)}%)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Clicked</h3>
                <p className="text-2xl font-semibold">{stats.clicked}</p>
                <p className="text-sm text-gray-500">({(stats.clickRate * 100).toFixed(1)}%)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Converted</h3>
                <p className="text-2xl font-semibold">{stats.converted}</p>
                <p className="text-sm text-gray-500">({(stats.conversionRate * 100).toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Email Templates"
      >
        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="p-4 border rounded-lg hover:border-gray-400 cursor-pointer"
            >
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.subject}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Segment Modal */}
      <Modal
        isOpen={showSegmentModal}
        onClose={() => setShowSegmentModal(false)}
        title="Customer Segments"
      >
        <div className="space-y-4">
          {segments.map(segment => (
            <div
              key={segment.id}
              className="p-4 border rounded-lg"
            >
              <h3 className="font-medium">{segment.name}</h3>
              <p className="text-sm text-gray-600">{segment.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {segment.customerCount} customers
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default EmailCampaigns; 