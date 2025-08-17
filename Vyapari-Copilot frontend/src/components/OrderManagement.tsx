import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageCircle, Eye, Edit, Trash2, X } from 'lucide-react';
import { getOrdersData, createNewOrder, deleteOrder, updateOrderStatus } from '../services/api';
import { Order } from '../types';

// =======================================================
//  The Modal Component (to be added at the end of the file)
// =======================================================
const OrderDetailsModal = ({ order, onClose }: { order: Order | null, onClose: () => void }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Order Details: {order.id}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* --- RESTORED CUSTOMER & ITEM SECTIONS --- */}
          <div className="border-b pb-4">
            <p className="text-sm text-gray-500 mb-1">Customer</p>
            <p className="font-semibold text-gray-900 text-lg">{order.customerName}</p>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>
          <div className="border-b pb-4">
             <p className="text-sm text-gray-500 mb-1">Items</p>
             <p className="font-semibold text-gray-900">{order.items[0]?.name || 'N/A'}</p>
          </div>

          {/* --- CORRECTED FINANCIAL BREAKDOWN --- */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-md">
            <p className="text-gray-600">Gross Amount:</p>
            <p className="font-medium text-gray-900 text-right">₹{order.grossAmount.toLocaleString('en-IN')}</p>
            
            <p className="text-gray-600">Discount:</p>
            <p className="font-medium text-red-600 text-right">
              - ₹{order.discount.toLocaleString('en-IN')}
              {order.discountString && ` (${order.discountString})`}
            </p>

            <p className="text-gray-600 font-bold border-t pt-2 mt-1">Final Amount:</p>
            <p className="font-bold text-gray-900 text-right border-t pt-2 mt-1">₹{order.totalAmount.toLocaleString('en-IN')}</p>
            
            <p className="text-gray-600">Cost Price:</p>
            <p className="font-medium text-gray-900 text-right">₹{order.costPrice.toLocaleString('en-IN')}</p>
          </div>
           <div className="grid grid-cols-2 gap-x-4 pt-3 border-t">
            <p className="text-gray-800 font-bold text-lg">Profit:</p>
            <p className="font-bold text-emerald-600 text-lg text-right">₹{order.profit.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
// =======================================================
// Your Main Component with the manual additions
// =======================================================
const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  
  // STEP 3 ADDITION
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      const liveOrders = await getOrdersData();
      const sortedOrders = liveOrders.reverse(); // Reverse the list here in the frontend
      // STEP 6 ADDITION
      const formattedOrders = sortedOrders.map((order: any) => ({
          id: order.id,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          items: [{ name: order.items, quantity: 1, price: order.amount }],
          totalAmount: order.amount,
          grossAmount: order.grossAmount,
          discount: order.discount,
          discountString: order.discountString,
          profit: order.profit,
          costPrice: order.costPrice,
          status: order.status.toLowerCase(),
          orderDate: order.date,
      }));
      setOrders(formattedOrders);
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  // STEP 4 ADDITION
  const handleViewDetails = (event: React.MouseEvent, order: Order) => {
    event.preventDefault(); 
    console.log("View button clicked for order:", order.id); // <-- ADD THIS LINE
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenNewOrderModal = () => setIsNewOrderModalOpen(true);
  const handleCloseNewOrderModal = () => setIsNewOrderModalOpen(false);

  const handleSaveOrder = async (orderData: any) => {
    try {
      await createNewOrder(orderData);
      handleCloseNewOrderModal();

      // This section now correctly maps ALL data fields, just like useEffect
      const liveOrders = await getOrdersData();
      const formattedOrders = liveOrders.map((order: any) => ({
          id: order.id,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          items: [{ name: order.items, quantity: 1, price: order.amount }],
          totalAmount: order.amount,
          grossAmount: order.grossAmount,
          discount: order.discount,
          discountString: order.discountString,
          profit: order.profit,
          costPrice: order.costPrice,
          status: order.status.toLowerCase(),
          orderDate: order.date,
      }));
      
      setOrders(formattedOrders);

    } catch (error) {
      console.error("Failed to save and refresh order list:", error);
    }
  };

  const handleDeleteOrder = async (orderIdToDelete: string) => {
    // Show a confirmation box before deleting
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderIdToDelete);
        // After deleting, refresh the list by filtering out the deleted order
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderIdToDelete));
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Error: Could not delete the order."); // Show a simple error to the user
      }
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    // We keep a copy of the original orders, just in case the save fails
    const originalOrders = orders;
  
    // 1. We instantly update the UI so it feels fast for the user.
    //    This is a professional technique called an "optimistic update".
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    try {
      // 2. In the background, we send the change to the backend to be saved permanently.
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      // 3. If the save fails, we show an error and revert the UI back to its original state.
      alert('Failed to save status update. The change has been reverted.');
      setOrders(originalOrders); 
    }
  };

  const sendWhatsAppBill = (order: Order) => {
    const message = `Hi ${order.customerName}! Your order ${order.id} for ₹${order.totalAmount} is ready. Thank you!`;
    const whatsappUrl = `https://wa.me/${order.customerPhone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading orders...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Your Full Header and Filter JSX */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all your orders</p>
          </div>
          <button onClick={handleOpenNewOrderModal}  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>New Order</span>
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by customer name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Your Full Table JSX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Order ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Customer Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Phone No</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Items</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-medium text-gray-900">{order.id}</span>
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-gray-500">{order.customerPhone}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600">{order.items[0]?.name || 'N/A'}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                </td>
                <td className="py-4 px-6">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => sendWhatsAppBill(order)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Send WhatsApp Bill"><MessageCircle className="h-4 w-4" /></button>
                    <button type="button" onClick={(e) => handleViewDetails(e,order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details"><Eye className="h-4 w-4" /></button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Edit Order"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* STEP 8 ADDITION */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
      )}
      
      {isNewOrderModalOpen && (
        <NewOrderModal onClose={handleCloseNewOrderModal} onSave={handleSaveOrder} />
      )}

    </div>

  );
};

// I've moved the modal component here, to the bottom of the file
export default OrderManagement;

// =======================================================
//  NEW: The "New Order" Modal Component
// =======================================================

// This is the "blueprint" for our modal's props
interface NewOrderModalProps {
  onClose: () => void;
  onSave: (orderData: any) => Promise<void>;
}
const NewOrderModal = ({ onClose, onSave }: NewOrderModalProps) => {
  const [item, setItem] = useState('');
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState('');
  const [discount, setDiscount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!item || !qty || !rate) {
      setError('Item, Quantity, and Rate are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    
    const orderData = {
      item,
      qty: qty, // qty is already a number, no need to parse
      rate: parseFloat(rate),
      discount: discount.trim(), // send exactly what the user typed
      customerName,
      customerPhone
    };
    

    try {
      await onSave(orderData);
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Order</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Item Name (e.g., Denim Jeans)" value={item} onChange={(e) => setItem(e.target.value)} className="w-full p-3 border rounded-lg" />
          <div className="flex gap-4">
            <input type="number" placeholder="Quantity" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} className="w-full p-3 border rounded-lg" />
            <input type="number" placeholder="Rate per Item" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full p-3 border rounded-lg" />
          </div>
          <input type="text" placeholder="Discount (e.g., 100 or 10%)" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Customer Name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Customer Phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
            {isSaving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>
    </div>
  );
};