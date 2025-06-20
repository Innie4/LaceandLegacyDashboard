import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { customerService } from '../../services/customerService';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const statusColors = {
  active: 'bg-status-green/10 text-status-green',
  inactive: 'bg-status-gray/10 text-status-gray',
  blocked: 'bg-status-red/10 text-status-red',
};

const segmentColors = {
  new: 'bg-status-blue/10 text-status-blue',
  regular: 'bg-status-green/10 text-status-green',
  vip: 'bg-status-purple/10 text-status-purple',
};

// Minimal local types for mock frontend
interface Address {
  id: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}
interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'blocked';
  segment: 'new' | 'regular' | 'vip';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  registrationDate: string;
  addresses: Address[];
  notes: CustomerNote[];
  tags: string[];
}

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      // Use mock: set a dummy customer
      const data: Customer = {
        id: id!,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        status: 'active',
        segment: 'regular',
        totalOrders: 5,
        totalSpent: 500,
        averageOrderValue: 100,
        lastOrderDate: '',
        registrationDate: '',
        addresses: [],
        notes: [],
        tags: [],
      };
      setCustomer(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customer details. Please try again later.');
      console.error('Error fetching customer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Customer['status']) => {
    if (!customer) return;
    setCustomer(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleSegmentUpdate = async (newSegment: Customer['segment']) => {
    if (!customer) return;
    setCustomer(prev => prev ? { ...prev, segment: newSegment } : null);
  };

  const handleAddNote = async (note: Omit<CustomerNote, 'id' | 'createdAt'>) => {
    if (!customer || !newNote.trim()) return;
    const newNoteObj: CustomerNote = {
      ...note,
      id: Math.random().toString(),
      createdAt: new Date().toISOString(),
      createdBy: note.createdBy || 'Admin',
    };
    setCustomer(prev => prev ? {
      ...prev,
      notes: [...prev.notes, newNoteObj]
    } : null);
    setNewNote('');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        notes: prev.notes.filter(note => note.id !== noteId)
      } : null);
    } catch (err) {
      setError('Failed to delete note. Please try again later.');
      console.error('Error deleting note:', err);
    }
  };

  const handleAddTag = async (tag: string) => {
    if (!customer || !id || !newTag.trim()) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        tags: [...prev.tags, tag]
      } : null);
      setNewTag('');
    } catch (err) {
      setError('Failed to add tag. Please try again later.');
      console.error('Error adding tag:', err);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      } : null);
    } catch (err) {
      setError('Failed to remove tag. Please try again later.');
      console.error('Error removing tag:', err);
    }
  };

  const handleAddressUpdate = async (address: Address) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        addresses: prev.addresses.map(a => a.id === address.id ? address : a)
      } : null);
    } catch (err) {
      setError('Failed to update address. Please try again later.');
      console.error('Error updating address:', err);
    }
  };

  const handleNoteChange = (note: CustomerNote) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        notes: prev.notes.map(n => n.id === note.id ? note : n)
      } : null);
    } catch (err) {
      setError('Failed to update note. Please try again later.');
      console.error('Error updating note:', err);
    }
  };

  const handleAddressChange = (address: Address) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        addresses: prev.addresses.map(a => a.id === address.id ? address : a)
      } : null);
    } catch (err) {
      setError('Failed to update address. Please try again later.');
      console.error('Error updating address:', err);
    }
  };

  const handleTagChange = (tag: string) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        tags: [...prev.tags, tag]
      } : null);
    } catch (err) {
      setError('Failed to update tag. Please try again later.');
      console.error('Error updating tag:', err);
    }
  };

  const handleNoteInputChange = (note: CustomerNote) => {
    if (!customer || !id) return;
    try {
      setCustomer(prev => prev ? {
        ...prev,
        notes: prev.notes.map(n => n.id === note.id ? note : n)
      } : null);
    } catch (err) {
      setError('Failed to update note. Please try again later.');
      console.error('Error updating note:', err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-darkest"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="vintage-card bg-status-red/10 border border-status-red text-status-red p-4">
          Customer not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/customers')}
              className="vintage-button-icon"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-serif text-brown-darkest">
              {customer.firstName} {customer.lastName}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={customer.status}
              onChange={(e) => handleStatusUpdate(e.target.value as Customer['status'])}
              className="vintage-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={customer.segment}
              onChange={(e) => handleSegmentUpdate(e.target.value as Customer['segment'])}
              className="vintage-select"
            >
              <option value="new">New</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="vintage-card bg-status-red/10 border border-status-red text-status-red p-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Stats */}
            <div className="vintage-card">
              <h2 className="text-lg font-serif text-brown-darkest mb-4">
                Customer Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-brown-light">Total Orders</div>
                  <div className="text-2xl font-medium">{customer.totalOrders}</div>
                </div>
                <div>
                  <div className="text-sm text-brown-light">Total Spent</div>
                  <div className="text-2xl font-medium">
                    ${customer.totalSpent.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-brown-light">Average Order</div>
                  <div className="text-2xl font-medium">
                    ${customer.averageOrderValue.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-brown-light">Member Since</div>
                  <div className="text-2xl font-medium">
                    {format(new Date(customer.registrationDate), 'MMM yyyy')}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="vintage-card">
              <h2 className="text-lg font-serif text-brown-darkest mb-4">
                Notes
              </h2>
              <div className="space-y-4">
                {customer.notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between p-4 bg-brown-light/5 rounded"
                  >
                    <div>
                      <div className="text-sm text-brown-light">
                        {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')} by{' '}
                        {note.createdBy}
                      </div>
                      <div className="mt-1">{note.content}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="vintage-button-icon"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="vintage-input flex-1"
                  />
                  <button
                    onClick={() => handleAddNote({ content: newNote, createdBy: 'Admin' })}
                    className="vintage-button flex items-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <UserIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">
                  Contact Information
                </h2>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-brown-light">Email</div>
                  <div>{customer.email}</div>
                </div>
                {customer.phone && (
                  <div>
                    <div className="text-sm text-brown-light">Phone</div>
                    <div>{customer.phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">
                  Addresses
                </h2>
              </div>
              <div className="space-y-4">
                {customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 bg-brown-light/5 rounded"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium uppercase">
                        {address.type}
                      </span>
                      {address.isDefault && (
                        <span className="text-xs text-status-green">Default</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div>{address.street}</div>
                      <div>
                        {address.city}, {address.state} {address.zipCode}
                      </div>
                      <div>{address.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="vintage-card">
              <div className="flex items-center space-x-2 mb-4">
                <TagIcon className="w-5 h-5 text-brown-light" />
                <h2 className="text-lg font-serif text-brown-darkest">Tags</h2>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brown-light/10 text-brown-darkest"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-status-red"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="vintage-input flex-1"
                  />
                  <button
                    onClick={() => handleAddTag(newTag)}
                    className="vintage-button flex items-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}; 