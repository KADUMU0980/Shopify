'use client';

import { useState } from 'react';
import { bulkProductSchema, BulkProductInput } from '@/lib/validations/bulkProductSchema';
import { toast } from 'react-hot-toast';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BulkProductInput | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/json') {
      toast.error('Please upload a valid JSON file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validation = bulkProductSchema.safeParse(json);
        
        if (!validation.success) {
          toast.error('Validation failed. Check errors below.');
          setErrors(validation.error.issues);
          setParsedData(null);
        } else {
          setErrors([]);
          setParsedData(validation.data);
          toast.success(`Successfully parsed ${validation.data.items.length} products`);
        }
      } catch (err) {
        toast.error('Failed to parse JSON file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setIsUploading(true);
    setProgress(0);

    const CHUNK_SIZE = 500;
    const items = parsedData.items;
    const totalChunks = Math.ceil(items.length / CHUNK_SIZE);
    
    let totalInserted = 0;
    let totalUpdated = 0;

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = items.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const payload = {
          category: parsedData.category,
          items: chunk,
        };

        const res = await fetch('/api/admin/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to upload chunk');
        }

        const data = await res.json();
        totalInserted += data.insertedCount;
        totalUpdated += data.updatedCount;
        
        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      toast.success(`Import complete: ${totalInserted} inserted, ${totalUpdated} updated`);
      setFile(null);
      setParsedData(null);
      
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Import Products</h1>
        <p className="text-gray-500 mt-2">
          Upload a JSON file containing a category and an array of products.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload JSON File
        </label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        
        {errors.length > 0 && (
          <div className="mt-6 bg-red-50 p-4 rounded-md">
            <h3 className="text-red-800 font-medium">Validation Errors</h3>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside max-h-60 overflow-y-auto">
              {errors.map((err, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{err.path.join('.')}</span>: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {parsedData && !errors.length && (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Preview</h2>
              <p className="text-sm text-gray-500 mt-1">
                Category: <span className="font-medium text-gray-900">{parsedData.category}</span>
                <span className="mx-2">•</span>
                Total Items: <span className="font-medium text-gray-900">{parsedData.items.length}</span>
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={isUploading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? 'Importing...' : 'Start Import'}
            </button>
          </div>

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <div className="overflow-x-auto border rounded-md max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedData.items.slice(0, 50).map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.items.length > 50 && (
            <p className="text-center text-sm text-gray-500 italic">Showing first 50 items...</p>
          )}
        </div>
      )}
    </div>
  );
}
