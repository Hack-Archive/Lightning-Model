import React from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);

/**
 * @param {Object} props
 * @param {string} props.content
 */
const ChatMarkdown = ({ content }) => {
  const components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');

      const isInline = !className || !match;
      
      if (isInline) {
        return (
          <code className={className} {...props}> 
            {children}
          </code>
        );
      }
      
      return (
        <div className="rounded-md overflow-hidden my-2">
          <SyntaxHighlighter
            language={lang}
            style={oneDark}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.375rem',
            }}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      );
    }
  };

  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default ChatMarkdown;