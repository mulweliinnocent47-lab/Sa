
"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText } from "lucide-react";

export function TxtReader({ src, fallback, format = "auto" }) {
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) {
      setText(null);
      setError("No text source provided.");
      return;
    }

    const controller = new AbortController();

    setText(null);
    setError(null);

    async function loadText() {
      try {
        const response = await fetch(src, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();
        setText(content);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load text.");
        }
      }
    }

    loadText();

    return () => controller.abort();
  }, [src]);

  // Markdown is enabled for .md files or when explicitly requested.
  const isMarkdown =
    format === "markdown" ||
    (format === "auto" &&
      /\.md(?:$|[?#])/i.test(src || ""));

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4 shrink-0" />
          Unable to load note
        </div>

        <p className="mt-2 break-words text-sm text-muted-foreground">
          {error}
        </p>

        {fallback ? (
          <div className="prose-txt mt-4 min-w-0 max-w-full">
            {fallback}
          </div>
        ) : null}
      </div>
    );
  }

  if (text === null) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
        role="status"
      >
        <Loader2 className="size-4 animate-spin" />
        Loading note…
      </div>
    );
  }

  return (
    <article
      className="
        min-w-0 w-full max-w-full
        rounded-xl border border-border
        bg-background
        p-4 sm:p-6 md:p-8
        text-sm leading-7 text-foreground
        sm:text-base
        [&_*]:min-w-0
      "
    >
      {isMarkdown ? (
        <div
          className="
            prose-txt max-w-none
            break-words
            [overflow-wrap:anywhere]
            [&_pre]:max-w-full
            [&_pre]:overflow-x-auto
            [&_pre]:rounded-lg
            [&_pre]:p-4
            [&_pre]:text-sm
            [&_table]:block
            [&_table]:max-w-full
            [&_table]:overflow-x-auto
            [&_img]:max-w-full
          "
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
        </div>
      ) : (
        <div
          className="
            whitespace-pre-wrap
            break-words
            [overflow-wrap:anywhere]
            font-sans
            leading-7
            tab-size-4
            selection:bg-primary/20
          "
        >
          {text}
        </div>
      )}
    </article>
  );
}
