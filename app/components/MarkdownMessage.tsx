import React from 'react';
import { Citation } from '../types';
import { File } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  citations?: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

/**
 * Parse and render structured markdown content from LLM
 * Handles headers (##), bullet points (•), bold text (**), and citations [S1]
 */
export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, citations, onCitationClick }) => {
  const lines = content.split('\n').filter(line => line.trim());
  
  const renderLine = (line: string, index: number) => {
    const trimmedLine = line.trim();
    
    // Handle section headers (## Header)
    if (trimmedLine.startsWith('##')) {
      const headerText = trimmedLine.replace(/^##\s*/, '');
      return (
        <h3 key={index} className="text-base font-semibold mt-4 mb-2 text-gray-900 dark:text-white first:mt-0">
          {headerText}
        </h3>
      );
    }
    
    // Handle bullet points (• text)
    if (trimmedLine.startsWith('•')) {
      const bulletText = trimmedLine.replace(/^•\s*/, '');
      return (
        <div key={index} className="flex gap-2 mb-2">
          <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0">•</span>
          <div className="flex-1">
            {renderTextWithFormatting(bulletText)}
          </div>
        </div>
      );
    }
    
    // Handle regular paragraphs
    if (trimmedLine) {
      return (
        <p key={index} className="mb-3 leading-relaxed">
          {renderTextWithFormatting(trimmedLine)}
        </p>
      );
    }
    
    return null;
  };
  
  /**
   * Render text with inline formatting (bold, citations)
   */
  const renderTextWithFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Combined regex to match both **bold** and [S1] patterns
    const formatRegex = /(\*\*.*?\*\*|\[S\d+\])/g;
    let match;
    
    while ((match = formatRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      
      const matchedText = match[0];
      
      // Handle bold text **text**
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        const boldText = matchedText.slice(2, -2);
        parts.push(
          <strong key={`bold-${match.index}`} className="font-semibold text-gray-900 dark:text-white">
            {boldText}
          </strong>
        );
      }
      // Handle citations [S1]
      else if (matchedText.startsWith('[S') && matchedText.endsWith(']')) {
        const sourceNum = parseInt(matchedText.match(/\d+/)?.[0] || '0');
        const citation = citations?.[sourceNum - 1];
        
        if (citation && onCitationClick) {
          parts.push(
            <button
              key={`cite-${match.index}`}
              onClick={() => onCitationClick(citation)}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
              title={`View source: Page ${citation.page}`}
            >
              <File className="w-2.5 h-2.5" />
              {matchedText}
            </button>
          );
        } else {
          parts.push(
            <span key={`cite-${match.index}`} className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
              {matchedText}
            </span>
          );
        }
      }
      
      currentIndex = match.index + matchedText.length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }
    
    return <>{parts}</>;
  };
  
  return (
    <div className="space-y-1">
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
};
