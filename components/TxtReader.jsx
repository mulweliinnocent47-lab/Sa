"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { notesSchema } from "@/lib/notesSchema";
import { Loader2 } from "lucide-react";
import { formatNotes } from "@/lib/formatNotes";

export function TxtReader({ src, fallback }) {
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setText(null);
    setError(null);
    fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((t) => !cancelled && setText(t))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [src]);

  const markdown = useMemo(() => (text === null ? "" : formatNotes(text)), [text]);

  if (error) return (
    <div className="rounded-xl border border-border bg-muted/50 p-6 text-sm text-muted-foreground">
      Couldn't load this text source ({error}).
      {fallback ? <div className="prose-txt mt-4">{fallback}</div> : null}
    </div>
  );

  if (text === null) return (
    <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading text…
    </div>
  );

  return (
    <article className="prose-txt max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, notesSchema], rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="table-wrap"><table {...props} /></div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
