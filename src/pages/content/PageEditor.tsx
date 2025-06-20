import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PlusIcon, EyeIcon, QrCodeIcon, DevicePhoneMobileIcon, DeviceTabletIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import pageService, { Page } from '../../services/pageService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

interface PageComponent {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface PageContent {
  components: PageComponent[];
}

interface FormData {
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  template: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface SelectEvent {
  target: {
    value: string;
  };
}

interface PageEditorProps {
  isNew?: boolean;
}

const PageEditor: React.FC<PageEditorProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    status: 'draft',
    template: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    setLoading(true);
    const data = {
      id: id!,
      title: 'Mock Page',
      slug: 'mock-page',
      content: { components: [] },
      status: 'draft' as 'draft',
      template: '',
      seo: { title: '', description: '', keywords: [] },
      createdAt: '',
      updatedAt: '',
      version: 1,
      revisions: []
    };
    setPage(data);
    setFormData({
      title: data.title,
      slug: data.slug,
      status: data.status,
      template: data.template,
      seo: data.seo
    });
    setError(null);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !page) return;

    const components = Array.from(page.content.components);
    const [reorderedItem] = components.splice(result.source.index, 1);
    components.splice(result.destination.index, 0, reorderedItem);

    setPage({
      ...page,
      content: {
        ...page.content,
        components
      }
    });
  };

  const handleAddComponent = (type: string) => {
    const newComponent: PageComponent = {
      id: `component-${Date.now()}`,
      type,
      props: {}
    };

    setPage(prev => prev ? {
      ...prev,
      content: {
        ...prev.content,
        components: [...(prev.content.components || []), newComponent]
      }
    } : null);

    setShowComponentModal(false);
  };

  const handleUpdateComponent = (componentId: string, props: Record<string, any>) => {
    if (!page) return;
    setPage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...prev.content,
          components: prev.content.components.map((comp: PageComponent) =>
            comp.id === componentId ? { ...comp, props } : comp
          )
        }
      };
    });
  };

  const handleSave = async () => {
    // Mock save: just update local state and show toast
    setPage(prev => prev ? { ...prev, ...formData } : null);
    toast.success('Page saved (mock)');
  };

  const handlePublish = async () => {
    toast.success('Page published (mock)');
  };

  const handleAnalyzeSEO = async () => {
    if (!page) return;
    setSeoAnalysis({ score: 100, message: 'SEO is great!' });
    console.log('SEO analysis: OK');
  };

  const renderComponent = (component: PageComponent) => {
    switch (component.type) {
      case 'heading':
        return (
          <h2 className="text-2xl font-bold mb-4" {...component.props}>
            {component.props.text}
          </h2>
        );
      case 'paragraph':
        return (
          <p className="mb-4" {...component.props}>
            {component.props.text}
          </p>
        );
      case 'image':
        return (
          <img
            src={component.props.src}
            alt={component.props.alt}
            className="max-w-full h-auto mb-4"
            {...component.props}
          />
        );
      // Add more component types as needed
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="space-y-4">
          <Input
            label="Page Title"
            value={formData.title}
            onChange={handleInputChange}
            name="title"
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={handleInputChange}
            name="slug"
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(value) => handleSelectChange('status', value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'scheduled', label: 'Scheduled' }
            ]}
          />
          <Select
            label="Template"
            value={formData.template}
            onChange={(value) => handleSelectChange('template', value)}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'landing', label: 'Landing Page' },
              { value: 'blog', label: 'Blog Post' }
            ]}
          />
          <div className="space-y-2">
            <h3 className="font-medium">SEO Settings</h3>
            <Input
              label="Meta Title"
              value={formData.seo.title}
              onChange={handleInputChange}
              name="seo.title"
            />
            <Input
              label="Meta Description"
              value={formData.seo.description}
              onChange={handleInputChange}
              name="seo.description"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            className="w-full"
          >
            Save
          </Button>
          {!isNew && (
            <Button
              variant="secondary"
              onClick={handlePublish}
              className="w-full"
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowComponentModal(true)}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Component
              </Button>
              <Button
                variant="secondary"
                onClick={handleAnalyzeSEO}
              >
                <QrCodeIcon className="w-5 h-5 mr-2" />
                Analyze SEO
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={previewMode === 'desktop' ? 'primary' : 'secondary'}
                onClick={() => setPreviewMode('desktop')}
              >
                <ComputerDesktopIcon className="w-5 h-5" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'primary' : 'secondary'}
                onClick={() => setPreviewMode('tablet')}
              >
                <DeviceTabletIcon className="w-5 h-5" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'primary' : 'secondary'}
                onClick={() => setPreviewMode('mobile')}
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Builder */}
        <div className="flex-1 overflow-auto p-4">
          <div className={`mx-auto ${
            previewMode === 'desktop' ? 'max-w-4xl' :
            previewMode === 'tablet' ? 'max-w-2xl' :
            'max-w-md'
          }`}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="page-components">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {page?.content.components.map((component: PageComponent, index: number) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative group"
                          >
                            {renderComponent(component)}
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100">
                              <Button
                                variant="secondary"
                                onClick={() => setSelectedComponent(component)}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Component Modal */}
      <Modal
        isOpen={showComponentModal}
        onClose={() => setShowComponentModal(false)}
        title="Add Component"
      >
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAddComponent('heading')}
            className="p-4 border rounded-lg hover:border-gray-400"
          >
            <h3 className="font-medium">Heading</h3>
            <p className="text-sm text-gray-600">Add a heading component</p>
          </button>
          <button
            onClick={() => handleAddComponent('paragraph')}
            className="p-4 border rounded-lg hover:border-gray-400"
          >
            <h3 className="font-medium">Paragraph</h3>
            <p className="text-sm text-gray-600">Add a text paragraph</p>
          </button>
          <button
            onClick={() => handleAddComponent('image')}
            className="p-4 border rounded-lg hover:border-gray-400"
          >
            <h3 className="font-medium">Image</h3>
            <p className="text-sm text-gray-600">Add an image component</p>
          </button>
        </div>
      </Modal>

      {/* Component Edit Modal */}
      <Modal
        isOpen={!!selectedComponent}
        onClose={() => setSelectedComponent(null)}
        title="Edit Component"
      >
        {selectedComponent && (
          <div className="space-y-4">
            {Object.entries(selectedComponent.props).map(([key, value]) => (
              <Input
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value as string}
                onChange={(e) => handleUpdateComponent(selectedComponent.id, {
                  ...selectedComponent.props,
                  [key]: e.target.value
                })}
              />
            ))}
          </div>
        )}
      </Modal>

      {/* SEO Analysis Modal */}
      <Modal
        isOpen={!!seoAnalysis}
        onClose={() => setSeoAnalysis(null)}
        title="SEO Analysis"
      >
        {seoAnalysis && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Word Count</h3>
              <p>{seoAnalysis.wordCount} words</p>
            </div>
            <div>
              <h3 className="font-medium">Readability Score</h3>
              <p>{seoAnalysis.readabilityScore}/100</p>
            </div>
            <div>
              <h3 className="font-medium">Keyword Density</h3>
              <ul className="list-disc list-inside">
                {Object.entries(seoAnalysis.keywordDensity).map(([keyword, density]) => (
                  <li key={keyword}>
                    {keyword}: {(density as number * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Suggestions</h3>
              <ul className="list-disc list-inside">
                {seoAnalysis.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PageEditor; 