@@ .. @@
 import React, { useState, useEffect, useMemo } from 'react';
-import { DollarSign, Tag, Calendar, Search, Plus, X, Edit, Trash2, ArrowUpDown, Download } from 'lucide-react';
+import { DollarSign, Tag, Calendar, Search, Plus, X, Edit, Trash2, ArrowUpDown, Download, TrendingUp, CreditCard, FolderSearch } from 'lucide-react';
 import { getExpensesData, createNewExpense, deleteExpense, updateExpense } from '../services/api';
 import { Expense } from '../types';
 import Papa from 'papaparse'; // <-- NEW IMPORT
@@ .. @@
   const topCategoryName = Object.keys(categoryTotals).reduce((a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b), 'None');

   if (isLoading) return <div className="p-6 text-center">Loading expenses...</div>;
+
+  const getCategoryColor = (category: string) => {
+    const lowerCategory = category.toLowerCase();
+    switch (lowerCategory) {
+      case 'food': return 'bg-green-100 text-green-800';
+      case 'utilities': return 'bg-blue-100 text-blue-800';
+      case 'rent': return 'bg-orange-100 text-orange-800';
+      case 'transport': return 'bg-purple-100 text-purple-800';
+      case 'supplies': return 'bg-yellow-100 text-yellow-800';
+      case 'maintenance': return 'bg-red-100 text-red-800';
+      default: return 'bg-gray-100 text-gray-800';
+    }
+  };

   return (
@@ .. @@
       <div className="mb-8 flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
           <p className="text-gray-600 mt-2">Track and analyze your business spending</p>
         </div>
-        <div className="flex items-center space-x-4">
-            <button onClick={handleDownloadCsv} className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center space-x-2">
-                <Download className="h-4 w-4" />
-                <span>Download CSV</span>
-            </button>
-            <button onClick={handleOpenNewExpenseModal} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2">
-                <Plus className="h-5 w-5" />
-                <span>New Expense</span>
-            </button>
-        </div>
+        <button onClick={handleDownloadCsv} className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center space-x-2">
+          <Download className="h-4 w-4" />
+          <span>Download CSV</span>
+        </button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
-        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-600">Total Expenses (Today)</p><p className="text-2xl font-bold text-gray-900 mt-1">₹{totalToday.toLocaleString('en-IN')}</p></div>
-        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-600">Total Expenses (Month)</p><p className="text-2xl font-bold text-gray-900 mt-1">₹{totalMonth.toLocaleString('en-IN')}</p></div>
-        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-600">Top Category (Month)</p><p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{topCategoryName}</p></div>
+        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500 border-t border-r border-b border-gray-100">
+          <div className="flex items-center justify-between">
+            <div>
+              <p className="text-sm font-medium text-gray-600">Total Expenses (Today)</p>
+              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalToday.toLocaleString('en-IN')}</p>
+            </div>
+            <div className="bg-blue-100 p-3 rounded-lg">
+              <CreditCard className="h-6 w-6 text-blue-600" />
+            </div>
+          </div>
+        </div>
+        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-emerald-500 border-t border-r border-b border-gray-100">
+          <div className="flex items-center justify-between">
+            <div>
+              <p className="text-sm font-medium text-gray-600">Total Expenses (Month)</p>
+              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalMonth.toLocaleString('en-IN')}</p>
+            </div>
+            <div className="bg-emerald-100 p-3 rounded-lg">
+              <DollarSign className="h-6 w-6 text-emerald-600" />
+            </div>
+          </div>
+        </div>
+        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500 border-t border-r border-b border-gray-100">
+          <div className="flex items-center justify-between">
+            <div>
+              <p className="text-sm font-medium text-gray-600">Top Category (Month)</p>
+              <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{topCategoryName}</p>
+            </div>
+            <div className="bg-purple-100 p-3 rounded-lg">
+              <TrendingUp className="h-6 w-6 text-purple-600" />
+            </div>
+          </div>
+        </div>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
@@ -119,15 +149,15 @@ const ExpenseManagement: React.FC = () => {
           <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"/>
         </div>
-        {/* --- YOUR NEW DROPDOWN --- */}
-        <div>
-          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
-            <option value="all">All Time</option>
-            <option value="today">Today</option>
-            <option value="week">This Week</option>
-            <option value="month">This Month</option>
-          </select>
+        <div className="flex items-center space-x-2">
+          <button onClick={() => setDateFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Time</button>
+          <button onClick={() => setDateFilter('today')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateFilter === 'today' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Today</button>
+          <button onClick={() => setDateFilter('week')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateFilter === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>This Week</button>
+          <button onClick={() => setDateFilter('month')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${dateFilter === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>This Month</button>
         </div>
       </div>

@@ .. @@
             <tbody className="divide-y divide-gray-200">
               {processedExpenses.map((expense) => (
-                <tr key={expense.id} className="hover:bg-gray-50">
-                  <td className="py-4 px-6 font-medium text-gray-600">{expense.expenseId || 'N/A'}</td>
+                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
+                  <td className="py-4 px-6">
+                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
+                      {expense.expenseId || 'N/A'}
+                    </span>
+                  </td>
                   <td className="py-4 px-6 font-medium text-gray-900">{expense.item}</td>
-                  <td className="py-4 px-6"><span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">{expense.category}</span></td>
+                  <td className="py-4 px-6">
+                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
+                      {expense.category}
+                    </span>
+                  </td>
                   <td className="py-4 px-6 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                   <td className="py-4 px-6 text-right font-semibold text-gray-900">₹{expense.amount.toLocaleString('en-IN')}</td>
                   <td className="py-4 px-6 text-center"><div className="flex items-center justify-center space-x-2"><button onClick={() => handleOpenEditExpenseModal(expense)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button><button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button></div></td>
@@ .. @@
       
       {processedExpenses.length === 0 && (
-        <div className="text-center py-12"><p className="text-gray-500 text-lg">No expenses found</p><p className="text-gray-400 mt-1">Try creating a new expense or adjusting your search.</p></div>
+        <div className="text-center py-16">
+          <div className="flex justify-center mb-4">
+            <div className="bg-gray-100 p-6 rounded-full">
+              <FolderSearch className="h-12 w-12 text-gray-400" />
+            </div>
+          </div>
+          <p className="text-gray-500 text-lg font-medium">No expenses found</p>
+          <p className="text-gray-400 mt-2">Try creating a new expense or adjusting your search filters.</p>
+        </div>
       )}

+      {/* Floating Action Button */}
+      <button
+        onClick={handleOpenNewExpenseModal}
+        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
+        title="Add New Expense"
+      >
+        <Plus className="h-6 w-6" />
+      </button>
+
        {isNewExpenseModalOpen && (<NewExpenseModal onClose={handleCloseNewExpenseModal} onSave={handleSaveExpense} />)}
        {isEditExpenseModalOpen && selectedExpense && (<EditExpenseModal expense={selectedExpense} onClose={handleCloseEditExpenseModal} onSave={handleUpdateExpense} />)}
     </div>