import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import contentService, { Page, ContentFilters } from '../../services/contentService';
import Layout from '../../components/common/Layout';
import { DataTable, Column } from '../../components/common/DataTable';

interface SelectEvent {
  target: {
    value: string;
  };
}

const PageManagement: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContentFilters>({});

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const fetchedPages = await contentService.getPages(filters);
        setPages(fetchedPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [filters]);

  const handleFilterChange = (key: keyof ContentFilters, value: string | SelectEvent) => {
    const actualValue = typeof value === 'string' ? value : value.target.value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
  };

  const columns: Column<Page>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (page: Page) => (
        <Link to={`/content/pages/${page.id}/edit`} className="text-vintage-600 hover:text-vintage-700">
          {page.title}
        </Link>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (page: Page) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          page.status === 'published' ? 'bg-green-100 text-green-800' :
          page.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {page.status}
        </span>
      )
    },
    {
      key: 'template',
      header: 'Template',
      sortable: true,
      render: (page: Page) => page.template || 'Custom'
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      render: (page: Page) => format(new Date(page.updatedAt), 'MMM d, yyyy')
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Page Management</h1>
          <Link
            to="/content/pages/new"
            className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700"
          >
            New Page
          </Link>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow">
          <DataTable
            columns={columns}
            data={pages}
            keyExtractor={(page: Page) => page.id}
            onRowClick={(page: Page) => navigate(`/content/pages/${page.id}/edit`)}
            isLoading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default PageManagement;