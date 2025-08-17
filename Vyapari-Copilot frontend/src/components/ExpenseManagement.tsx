import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Tag, Calendar, Search, Plus, X, Edit, Trash2, ArrowUpDown, Download } from 'lucide-react';
import { getExpensesData, createNewExpense, deleteExpense, updateExpense } from '../services/api';
import { Expense } from '../types';
import Papa from 'papaparse'; // <-- NEW IMPORT

const ExpenseManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const fetchAndSetExpenses = async () => {
    const liveExpenses = await getExpensesData();
    setExpenses(liveExpenses);
  };

  useEffect(() => {
    fetchAndSetExpenses().finally(() => setIsLoading(false));
  }, []);

  const handleOpenNewExpenseModal = () => setIsNewExpenseModalOpen(true);
  const handleCloseNewExpenseModal = () => setIsNewExpenseModalOpen(false);
  const handleSaveExpense = async (expenseData: { item: string; category: string; amount: number; }) => {
    await createNewExpense(expenseData);
    handleCloseNewExpenseModal();
    await fetchAndSetExpenses();
  };

  const handleOpenEditExpenseModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditExpenseModalOpen(true);
  };
  const handleCloseEditExpenseModal = () => {
    setSelectedExpense(null);
    setIsEditExpenseModalOpen(false);
  };
  const handleUpdateExpense = async (expenseData: { item: string; category: string; amount: number; }) => {
    if (!selectedExpense) return;
    await updateExpense(selectedExpense.id, expenseData);
    handleCloseEditExpenseModal();
    await fetchAndSetExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId);
      await fetchAndSetExpenses();
    }
  };
  
  const requestSort = (key: keyof Expense) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const processedExpenses = useMemo(() => {
    let processedData = [...expenses];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter === 'today') {
        processedData = processedData.filter(exp => new Date(exp.date).toDateString() === today.toDateString());
    } else if (dateFilter === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        processedData = processedData.filter(exp => new Date(exp.date) >= startOfWeek);
    } else if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        processedData = processedData.filter(exp => new Date(exp.date) >= startOfMonth);
    }

    processedData = processedData.filter(exp =>
      exp.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processedData;
  }, [expenses, searchTerm, sortConfig, dateFilter]);

  // --- NEW CODE: CSV Download Handler ---
  const handleDownloadCsv = () => {
    const dataForCsv = processedExpenses.map(exp => ({
      'Expense ID': exp.expenseId || 'N/A',
      'Date': new Date(exp.date).toLocaleDateString('en-IN'),
      'Item/Reason': exp.item,
      'Category': exp.category,
      'Amount': exp.amount,
    }));
    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `expenses-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalToday = expenses
    .filter(exp => new Date(exp.date).toDateString() === new Date().toDateString())
    .reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategoryName = Object.keys(categoryTotals).reduce((a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b), 'None');

  if (isLoading) return <div className="p-6 text-center">Loading expenses...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
          <p className="text-gray-600 mt-2">Track and analyze your business spending</p>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={handleDownloadCsv} className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download CSV</span>
            </button>
            <button onClick={handleOpenNewExpenseModal} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>New Expense</span>
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-600">Total Expenses (Today)</p><p className="text-2xl font-bold text-gray-900 mt-1">₹{totalToday.toLocaleString('en-IN')}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-600">Total Expenses (Month)</p><p className="text-2xl font-bold text-gray-900 mt-1">₹{totalMonth.toLocaleString('en-IN')}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-600">Top Category (Month)</p><p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{topCategoryName}</p></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
        <div className="flex-1 relative max-w-xs">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
        </div>
        {/* --- YOUR NEW DROPDOWN --- */}
        <div>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-800"><button onClick={() => requestSort('expenseId')} className="flex items-center space-x-1"><span>Expense ID</span><ArrowUpDown className="h-4 w-4 text-gray-400" /></button></th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800"><button onClick={() => requestSort('item')} className="flex items-center space-x-1"><span>Item/Reason</span><ArrowUpDown className="h-4 w-4 text-gray-400" /></button></th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800"><button onClick={() => requestSort('category')} className="flex items-center space-x-1"><span>Category</span><ArrowUpDown className="h-4 w-4 text-gray-400" /></button></th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800"><button onClick={() => requestSort('date')} className="flex items-center space-x-1"><span>Date</span><ArrowUpDown className="h-4 w-4 text-gray-400" /></button></th>
                <th className="text-right py-4 px-6 font-semibold text-gray-800"><button onClick={() => requestSort('amount')} className="flex items-center space-x-1 ml-auto"><span>Amount</span><ArrowUpDown className="h-4 w-4 text-gray-400" /></button></th>
                <th className="text-center py-4 px-6 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-600">{expense.expenseId || 'N/A'}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{expense.item}</td>
                  <td className="py-4 px-6"><span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">{expense.category}</span></td>
                  <td className="py-4 px-6 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{expense.amount.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 text-center"><div className="flex items-center justify-center space-x-2"><button onClick={() => handleOpenEditExpenseModal(expense)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button><button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {processedExpenses.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-500 text-lg">No expenses found</p><p className="text-gray-400 mt-1">Try creating a new expense or adjusting your search.</p></div>
      )}

       {isNewExpenseModalOpen && (<NewExpenseModal onClose={handleCloseNewExpenseModal} onSave={handleSaveExpense} />)}
       {isEditExpenseModalOpen && selectedExpense && (<EditExpenseModal expense={selectedExpense} onClose={handleCloseEditExpenseModal} onSave={handleUpdateExpense} />)}
    </div>
  );
};

export default ExpenseManagement;

// --- Modal Components (No Changes) ---
// ...

interface NewExpenseModalProps {
  onClose: () => void;
  onSave: (expenseData: { item: string; category: string; amount: number; }) => Promise<void>;
}

const NewExpenseModal = ({ onClose, onSave }: NewExpenseModalProps) => {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!item || !amount) {
      setError('Item/Reason and Amount are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    const expenseData = { item, amount: parseFloat(amount), category };
    try {
      await onSave(expenseData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Log New Expense</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Item or Reason (e.g., Shop Rent)" value={item} onChange={(e) => setItem(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input type="number" placeholder="Amount (e.g., 500)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Category (e.g., food, utilities)" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
            {isSaving ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
  onSave: (expenseData: { item: string; category: string; amount: number; }) => Promise<void>;
}

const EditExpenseModal = ({ expense, onClose, onSave }: EditExpenseModalProps) => {
  const [item, setItem] = useState(expense.item);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!item || !amount) {
      setError('Item/Reason and Amount are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    const expenseData = { item, amount: parseFloat(amount), category };
    try {
      await onSave(expenseData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Expense</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Item or Reason" value={item} onChange={(e) => setItem(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-lg" />
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};