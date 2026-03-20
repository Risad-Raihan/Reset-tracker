"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownViewerProps {
  content: string;
  isPlainText?: boolean;
}

export function MarkdownViewer({ content, isPlainText = false }: MarkdownViewerProps) {
  if (isPlainText) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-surface border border-white/5 p-4 font-mono text-sm text-white/90">
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <div className="prose-reset max-w-none overflow-y-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
