'use client';

import { useState } from 'react';

interface ExpandableContentProps {
  type: 'poem' | 'essay';
  content: string[];
  fullContent?: string[];
  isTruncated?: boolean;
}

export default function ExpandableContent({
  type,
  content,
  fullContent,
  isTruncated,
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayContent = isExpanded && fullContent ? fullContent : content;
  const showExpandButton = isTruncated && fullContent && fullContent.length > content.length;

  return (
    <>
      {type === 'poem' ? (
        <div className="space-y-1 font-serif text-xl leading-relaxed">
          {displayContent.map((line, index) => (
            <p key={index} className={line === '' ? 'h-6' : 'my-0'}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      ) : (
        <div className="space-y-6 font-serif text-xl leading-relaxed">
          {displayContent.map((paragraph, index) => (
            <p key={index} className="text-stone-700 dark:text-stone-300">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {showExpandButton && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:border-stone-400 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-stone-500"
          >
            {isExpanded ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
                Show excerpt
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
                Read full {type}
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
