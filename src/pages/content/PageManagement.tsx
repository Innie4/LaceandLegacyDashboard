import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import pageService, { Page, PageTemplate } from '../../services/pageService';
import { DataTable } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const PageManagement: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    template: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  useEffect(() => {
    fetchPages();
    fetchTemplates();
  }, [filters]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await pageService.getPages(filters);
      setPages(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pages');
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await pageService.getTemplates();
      setTemplates(data);
    } catch (err) {
      toast.error('Failed to fetch templates');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreatePage = () => {
    navigate('/content/pages/new');
  };

  const handleEditPage = (page: Page) => {
    navigate(`/content/pages/${page.id}/edit`);
  };

  const handleDeletePage = async (page: Page) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await pageService.deletePage(page.id);
        toast.success('Page deleted successfully');
        fetchPages();
      } catch (err) {
        toast.error('Failed to delete page');
      }
    }
  };

  const handleCreateFromTemplate = async (template: PageTemplate) => {
    try {
      const newPage = await pageService.createPage({
        title: `New Page from ${template.name}`,
        template: template.id,
        content: template.structure,
        status: 'draft'
      });
      navigate(`/content/pages/${newPage.id}/edit`);
    } catch (err) {
      toast.error('Failed to create page from template');
    }
  };

  const handleViewRevisions = async (page: Page) => {
    setSelectedPage(page);
    setShowRevisionModal(true);
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!selectedPage) return;
    try {
      await pageService.restoreRevision(selectedPage.id, revisionId);
      toast.success('Revision restored successfully');
      setShowRevisionModal(false);
      fetchPages();
    } catch (err) {
      toast.error('Failed to restore revision');
    }
  };

  const columns = [
    {
      Header: 'Title',
      accessor: 'title',
      Cell: ({ row }: any) => (
        <div className="flex items-center space-x-3">
          <span className="font-medium">{row.original.title}</span>
          {row.original.status === 'draft' && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">Draft</span>
          )}
        </div>
      )
    },
    {
      Header: 'Template',
      accessor: 'template',
      Cell: ({ row }: any) => {
        const template = templates.find(t => t.id === row.original.template);
        return template?.name || 'Custom';
      }
    },
    {
      Header: 'Last Updated',
      accessor: 'updatedAt',
      Cell: ({ row }: any) => new Date(row.original.updatedAt).toLocaleDateString()
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }: any) => (
        <span className={`px-2 py-1 text-xs rounded ${
          row.original.status === 'published' ? 'bg-green-100 text-green-800' :
          row.original.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
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
            onClick={() => handleEditPage(row.original)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewRevisions(row.original)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <ClockIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeletePage(row.original)}
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
        <h1 className="text-2xl font-semibold text-gray-900">Page Management</h1>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowTemplateModal(true)}
          >
            <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
            Templates
          </Button>
          <Button
            variant="primary"
            onClick={handleCreatePage}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search pages..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'scheduled', label: 'Scheduled' }
              ]}
            />
            <Select
              value={filters.template}
              onChange={(e) => handleFilterChange('template', e.target.value)}
              options={[
                { value: '', label: 'All Templates' },
                ...templates.map(t => ({ value: t.id, label: t.name }))
              ]}
            />
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
              }}
              options={[
                { value: 'updatedAt-desc', label: 'Last Updated (Newest)' },
                { value: 'updatedAt-asc', label: 'Last Updated (Oldest)' },
                { value: 'title-asc', label: 'Title (A-Z)' },
                { value: 'title-desc', label: 'Title (Z-A)' }
              ]}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={pages}
          loading={loading}
        />
      </div>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Page Templates"
      >
        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="p-4 border rounded-lg hover:border-gray-400 cursor-pointer"
              onClick={() => handleCreateFromTemplate(template)}
            >
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Revision Modal */}
      <Modal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        title="Page Revisions"
      >
        {selectedPage && (
          <div className="space-y-4">
            {selectedPage.revisions.map(revision => (
              <div
                key={revision.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Version {revision.version}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(revision.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleRestoreRevision(revision.id)}
                  >
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PageManagement; 