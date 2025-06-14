import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, EyeIcon, CodeIcon, DevicePhoneMobileIcon, DeviceTabletIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import pageService, { Page } from '../../services/pageService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

// Component types for the page builder
interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
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
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft',
    template: '',
    seo: {
      title: '',
      description: '',
      keywords: [] as string[]
    }
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchPage();
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const data = await pageService.getPage(id!);
      setPage(data);
      setFormData({
        title: data.title,
        slug: data.slug,
        status: data.status,
        template: data.template,
        seo: data.seo
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch page');
      toast.error('Failed to fetch page');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const components = Array.from(page?.content.components || []);
    const [reorderedItem] = components.splice(result.source.index, 1);
    components.splice(result.destination.index, 0, reorderedItem);

    setPage(prev => prev ? {
      ...prev,
      content: {
        ...prev.content,
        components
      }
    } : null);
  };

  const handleAddComponent = (type: string) => {
    const newComponent: Component = {
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

  const handleComponentEdit = (componentId: string, props: Record<string, any>) => {
    setPage(prev => prev ? {
      ...prev,
      content: {
        ...prev.content,
        components: prev.content.components.map(comp =>
          comp.id === componentId ? { ...comp, props } : comp
        )
      }
    } : null);
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        const newPage = await pageService.createPage({
          ...formData,
          content: page?.content || { components: [] }
        });
        navigate(`/content/pages/${newPage.id}/edit`);
      } else {
        await pageService.updatePage(id!, {
          ...formData,
          content: page?.content
        });
        toast.success('Page saved successfully');
      }
    } catch (err) {
      toast.error('Failed to save page');
    }
  };

  const handlePublish = async () => {
    try {
      await pageService.publishPage(id!);
      toast.success('Page published successfully');
      fetchPage();
    } catch (err) {
      toast.error('Failed to publish page');
    }
  };

  const handleAnalyzeSEO = async () => {
    try {
      const analysis = await pageService.analyzeSEO(page?.content.components.map(c => c.props.text).join(' ') || '');
      setSeoAnalysis(analysis);
    } catch (err) {
      toast.error('Failed to analyze SEO');
    }
  };

  const renderComponent = (component: Component) => {
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
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'scheduled', label: 'Scheduled' }
            ]}
          />
          <div className="space-y-2">
            <h3 className="font-medium">SEO Settings</h3>
            <Input
              label="Meta Title"
              value={formData.seo.title}
              onChange={(e) => handleInputChange('seo.title', e.target.value)}
            />
            <Input
              label="Meta Description"
              value={formData.seo.description}
              onChange={(e) => handleInputChange('seo.description', e.target.value)}
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
                <CodeIcon className="w-5 h-5 mr-2" />
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
                    {page?.content.components.map((component, index) => (
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
                onChange={(e) => handleComponentEdit(selectedComponent.id, {
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