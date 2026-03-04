"use client";

import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, Trash2 } from 'lucide-react';
import { useAppContext } from '../lib/context';
import { api } from '../lib/api';
import { DocumentInfo } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const DashboardScreen = () => {
  const { navigate, setActiveDocId, setActiveConvId } = useAppContext();
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      const data = await api.getDocuments();
      setDocs(data);
      setLoading(false);
    };
    fetchDocs();
  }, []);

  const refetchDocs = async () => {
    const data = await api.getDocuments();
    setDocs(data);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file;
    if ('dataTransfer' in e) { file = e.dataTransfer.files[0]; }
    else { file = e.target.files?.[0]; }
    if (!file) return;

    setLoading(true);
    const uploadedDoc = await api.uploadDocument(file);
    await api.indexDocument(uploadedDoc.id, () => {});
    await refetchDocs();
  };

  const openDoc = (id: string) => {
    setActiveDocId(id);
    setActiveConvId(null);
    navigate('workspace');
  };

  const deleteDoc = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDocs(docs.filter(d => d.id !== id));
    await api.deleteDocument(id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload and manage your knowledge base.</p>
        </div>
      </div>

      <div 
        className={`relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e); }}
      >
        <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Drop your PDF here</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">or click to browse from your computer (Max 50MB)</p>
        <label>
          <Button variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>Browse Files</Button>
          <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" /> Your Library
        </h2>
        {loading && docs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />)}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800">
            <p className="text-gray-500 dark:text-gray-400">No documents yet. Upload your first PDF to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => openDoc(doc.id)}
                className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge status={doc.status}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </Badge>
                  <button onClick={(e) => deleteDoc(e, doc.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1 flex-1">{doc.filename}</h3>
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
