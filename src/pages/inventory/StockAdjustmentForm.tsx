import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import { productService } from '../../services/productService';

// Define local type for StockAdjustment
interface StockAdjustment {
  productId: string;
  quantity: number;
  reason: string;
}

const StockAdjustmentForm: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    quantity: 0,
    type: 'in',
    reason: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await inventoryService.adjustStock({
        productId: form.productId,
        quantity: Number(form.quantity),
        type: form.type as 'in' | 'out' | 'adjustment',
        reason: form.reason,
        notes: form.notes,
      });
      setSuccess('Stock adjusted successfully!');
      setTimeout(() => navigate('/inventory'), 1200);
    } catch (err) {
      setError('Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Stock Adjustment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adjustment Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-vintage-600 text-white rounded hover:bg-vintage-700 disabled:opacity-50"
          >
            {loading ? 'Adjusting...' : 'Adjust Stock'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustmentForm; 