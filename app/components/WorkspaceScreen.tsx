"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Plus, ChevronLeft, X, Send, Paperclip,
  LayoutPanelLeft, BookOpen, File, Loader2, AlertCircle, Search, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../lib/context';
import { api } from '../lib/api';
import { DocumentInfo, Conversation, Message, Citation } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { MarkdownMessage } from './MarkdownMessage';

export const WorkspaceScreen = () => {
  const { activeDocId, activeConvId, setActiveConvId, navigate } = useAppContext();
  const [doc, setDoc] = useState<DocumentInfo | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexMsg, setIndexMsg] = useState('');
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSources, setShowSources] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!activeDocId) return;
      const allDocs = await api.getDocuments();
      const currentDoc = allDocs.find(d => d.id === activeDocId) || null;
      setDoc(currentDoc);
      
      const convs = await api.getConversations(activeDocId);
      setConversations(convs);
      
      if (activeConvId) {
        // Fetch full conversation details with messages
        try {
          const fullConv = await api.getConversationDetails(activeConvId);
          setCurrentConv(fullConv);
        } catch (error) {
          console.error('Failed to load conversation:', error);
          setCurrentConv(null);
        }
      } else {
        setCurrentConv(null);
      }
    };
    init();
  }, [activeDocId, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages]);

  const handleIndex = async () => {
    if (!doc) return;
    setIsIndexing(true);
    const updatedDoc = await api.indexDocument(doc.id, setIndexMsg);
    setDoc(updatedDoc);
    setIsIndexing(false);
  };

  const handleAsk = async () => {
    if (!input.trim() || !doc || doc.status !== 'indexed') return;
    const q = input.trim();
    setInput('');
    setIsAsking(true);
    
    const tempUserMsg: Message = { id: 'temp', role: 'user', content: q };
    const typingMsg: Message = { id: 'typing', role: 'assistant', content: '', isTyping: true };
    
    if (currentConv) {
      setCurrentConv({ ...currentConv, messages: [...currentConv.messages, tempUserMsg, typingMsg] });
    } else {
      setCurrentConv({ id: 'temp-c', documentId: doc.id, title: q, lastUpdated: '', messages: [tempUserMsg, typingMsg] });
    }

    try {
      const { conversation, response } = await api.askQuestion(doc.id, currentConv?.id || null, q);
      
      // Build messages array with existing messages + new user message + AI response
      const userMessage: Message = { id: `u${Date.now()}`, role: 'user', content: q };
      const updatedMessages = currentConv 
        ? [...currentConv.messages, userMessage, response]
        : [userMessage, response];
      
      const updatedConversation: Conversation = {
        ...conversation,
        messages: updatedMessages
      };
      
      setCurrentConv(updatedConversation);
      setActiveConvId(conversation.id);
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id);
        return exists 
          ? prev.map(c => c.id === conversation.id ? updatedConversation : c) 
          : [updatedConversation, ...prev];
      });
    } catch (error) {
      console.error('Failed to ask question:', error);
      // Remove typing indicator on error
      if (currentConv) {
        setCurrentConv({ 
          ...currentConv, 
          messages: currentConv.messages.filter(m => !m.isTyping) 
        });
      }
    } finally {
      setIsAsking(false);
    }
  };

  const onCitationClick = (citation: Citation) => {
    setActiveCitation(citation);
    setShowSources(true);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    
    try {
      await api.deleteConversation(convId);
      
      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== convId));
      
      // If deleted conversation was active, clear it
      if (currentConv?.id === convId) {
        setCurrentConv(null);
        setActiveConvId(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  if (!doc) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-zinc-950">
      
      {/* LEFT SIDEBAR */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-64 lg:w-72 flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 transition-all z-10 absolute md:relative h-full`}>
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('dashboard')} className="-ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <button className="md:hidden p-2 text-gray-500" onClick={() => setShowSidebar(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <Button variant="primary" className="w-full flex justify-start mb-6" onClick={() => { setCurrentConv(null); setActiveConvId(null); setShowSidebar(false); }}>
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
          
          <div className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Recent Chats</div>
          <div className="space-y-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">No history yet.</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group relative w-full text-left rounded-lg text-sm transition-colors ${currentConv?.id === conv.id ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                >
                  <button
                    onClick={() => { setActiveConvId(conv.id); setShowSidebar(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg truncate ${currentConv?.id === conv.id ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-zinc-400'}`}
                  >
                    <MessageSquare className="w-4 h-4 inline-block mr-2 opacity-50" />
                    {conv.title}
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded transition-all"
                    title="Delete conversation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CENTER CHAT PANEL */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-14 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md" onClick={() => setShowSidebar(true)}>
              <LayoutPanelLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 max-w-[200px] sm:max-w-md">
              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-medium text-sm truncate">{doc.filename}</span>
              <Badge status={doc.status}>{doc.status === 'indexed' ? 'Indexed' : 'Pending'}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSources(!showSources)} className="hidden md:flex">
            {showSources ? 'Hide Sources' : 'View Document'} <BookOpen className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Indexing Banner */}
        {doc.status !== 'indexed' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-amber-800 dark:text-amber-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-medium">Document requires indexing</p>
                <p className="opacity-80">Index this document to enable AI question answering and citations.</p>
              </div>
            </div>
            <Button size="sm" onClick={handleIndex} disabled={isIndexing} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0">
              {isIndexing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {indexMsg}</> : 'Index Document'}
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
          {(!currentConv || currentConv.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto fade-in">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-indigo-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Chat with your document</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Ask questions, extract data, or summarize the contents of <span className="font-medium text-gray-900 dark:text-gray-200">{doc.filename}</span>.</p>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                {['Summarize the main points of this document.', 'What are the key financial metrics?', 'Identify any risk factors mentioned.'].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-sm p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    &quot;{suggestion}&quot;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentConv.messages.map((msg, i) => (
              <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm rounded-bl-sm text-gray-800 dark:text-gray-200'
                }`}>
                  {msg.isTyping ? (
                    <div className="flex space-x-1.5 items-center h-5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <MarkdownMessage 
                      content={msg.content}
                      citations={msg.citations}
                      onCitationClick={onCitationClick}
                    />
                  ) : (
                    <div className="leading-relaxed">
                      {msg.content}
                    </div>
                  )}
                  
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
                      <details className="group">
                        <summary className="text-xs font-medium text-gray-400 dark:text-zinc-500 cursor-pointer hover:text-gray-600 dark:hover:text-zinc-400 transition-colors list-none flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                          View all sources ({msg.citations.length})
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.citations.map(cit => (
                            <button
                              key={cit.id}
                              onClick={() => onCitationClick(cit)}
                              className="inline-flex items-center px-2 py-1 rounded bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <File className="w-3 h-3 mr-1" /> Page {cit.page}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Composer */}
        <div className="p-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 z-10">
          <div className="max-w-4xl mx-auto relative flex items-end shadow-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
            <button className="p-3 text-gray-400 hover:text-indigo-500 cursor-not-allowed opacity-50 ml-1" title="Attachments handled in dashboard">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder={doc.status === 'indexed' ? "Ask anything about this document..." : "Index document to start asking..."}
              disabled={doc.status !== 'indexed' || isAsking}
              className="flex-1 max-h-32 min-h-[44px] py-3 px-2 bg-transparent resize-none focus:outline-none text-sm disabled:opacity-50"
              rows={1}
            />
            <button 
              onClick={handleAsk}
              disabled={!input.trim() || doc.status !== 'indexed' || isAsking}
              className="p-2 m-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 transition-colors flex shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-2 text-xs text-gray-400 dark:text-zinc-500">
            AI Assistant can make mistakes. Check important info.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: PDF Viewer */}
      {showSources && (
        <div className="w-full md:w-[400px] lg:w-[450px] border-l border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex flex-col absolute md:relative right-0 h-full z-20 animate-in slide-in-from-right-8 duration-300 shadow-2xl md:shadow-none">
          <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-white dark:bg-zinc-950">
            <h3 className="font-semibold flex items-center text-sm">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-500" /> Document Viewer
            </h3>
            <button onClick={() => setShowSources(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeCitation && (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Cited Snippet</span>
                  <Badge>Page {activeCitation.page}</Badge>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic border-l-2 border-indigo-400 pl-3 my-2">
                  &quot;{activeCitation.snippet}&quot;
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
              <div className="bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-2 flex justify-between items-center text-xs">
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="py-1 px-2 font-medium">Page {activeCitation?.page || 1} of {doc.pageCount || '?'}</span>
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-2 text-gray-500">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900/30 text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-zinc-700 mb-4" />
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-2">PDF Viewer Placeholder</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-[200px]">
                  In production, react-pdf or pdf.js would render page {activeCitation?.page || 1} here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
