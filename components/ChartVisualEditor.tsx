import React, { useState } from 'react';
import { ChartData, ChartType } from '../types';
import { Plus, Trash2, Settings, Database, RotateCcw } from 'lucide-react';

interface ChartVisualEditorProps {
  initialConfig: ChartData;
  onSave: (newConfig: ChartData) => void;
  onCancel: () => void;
}

export const ChartVisualEditor: React.FC<ChartVisualEditorProps> = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState<ChartData>(initialConfig);
  const [activeTab, setActiveTab] = useState<'settings' | 'data'>('data');

  const handleDataChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...config.data];
    // Attempt to convert to number if it looks like one
    const numValue = Number(value);
    newData[rowIndex] = {
      ...newData[rowIndex],
      [key]: isNaN(numValue) && value !== '' ? value : (value === '' ? '' : numValue)
    };
    setConfig({ ...config, data: newData });
  };

  const addRow = () => {
    // Clone the structure of the first row but with empty values
    const firstRow = config.data[0] || { name: 'New', value: 0 };
    const newRow: Record<string, any> = {};
    Object.keys(firstRow).forEach(k => newRow[k] = k === config.xAxisKey ? 'New' : 0);
    setConfig({ ...config, data: [...config.data, newRow] });
  };

  const deleteRow = (index: number) => {
    const newData = [...config.data];
    newData.splice(index, 1);
    setConfig({ ...config, data: newData });
  };

  const updateConfig = (key: keyof ChartData, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  // Extract all unique keys from data for the grid columns
  const allKeys = Array.from(new Set(config.data.flatMap(d => Object.keys(d))));
  // Ensure xAxisKey is first
  const columns = [config.xAxisKey, ...allKeys.filter(k => k !== config.xAxisKey)];

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-0 rounded-b-xl flex flex-col h-[300px]">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'data' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Database size={14} /> Data Grid
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Settings size={14} /> Configuration
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chart Title</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chart Type</label>
              <select
                value={config.type}
                onChange={(e) => updateConfig('type', e.target.value as ChartType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">X-Axis Key (Label)</label>
              <select
                value={config.xAxisKey}
                onChange={(e) => updateConfig('xAxisKey', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {allKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {col} {col === config.xAxisKey && <span className="text-blue-500">(X)</span>}
                    </th>
                  ))}
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {config.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group hover:bg-slate-50">
                    {columns.map(col => (
                      <td key={`${rowIndex}-${col}`} className="px-0 py-0">
                        <input
                          type="text"
                          value={row[col] ?? ''}
                          onChange={(e) => handleDataChange(rowIndex, col, e.target.value)}
                          className="w-full h-full px-3 py-2 border-none bg-transparent focus:ring-inset focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-2 text-center">
                      <button 
                        onClick={() => deleteRow(rowIndex)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        tabIndex={-1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addRow}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end gap-2 rounded-b-xl">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(config)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};
