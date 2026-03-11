/**
 * exportHtml.ts
 * Generates a standalone, self-contained HTML file from the editor's content.
 * All styles are inlined so the file is portable and works offline.
 */

interface ExportOptions {
  title: string;
  content: string; // Raw HTML from TipTap editor
  blocks: BlockData[]; // Custom blocks (image, embed, etc.)
}

export interface BlockData {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

/**
 * Generates a complete HTML document string ready to be saved as .html
 * Embeds all CSS inline and converts block placeholders to actual HTML elements
 */
export function generateStandaloneHtml(options: ExportOptions): string {
  const { title, content, blocks } = options;
  
  // Replace block placeholder divs with rendered HTML for each block type
  let processedContent = content;
  
  blocks.forEach((block) => {
    const placeholder = `<div data-block-id="${block.id}"></div>`;
    const rendered = renderBlockToHtml(block);
    processedContent = processedContent.replace(placeholder, rendered);
  });

  const timestamp = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || "Untitled Article")}</title>
  <style>
    /* ===== EXPORTED ARTICLE STYLES ===== */
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,600&family=JetBrains+Mono:wght@400&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --text: #1a1a1a;
      --text-muted: #666;
      --border: #e0e0e0;
      --accent: #c8912e;
      --bg-code: #f5f5f5;
      --font-body: 'DM Sans', sans-serif;
      --font-editorial: 'Libre Baskerville', serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    
    body {
      font-family: var(--font-editorial);
      font-size: 18px;
      line-height: 1.8;
      color: var(--text);
      background: #fff;
      padding: 40px 20px;
    }
    
    article {
      max-width: 740px;
      margin: 0 auto;
    }
    
    .article-meta {
      font-family: var(--font-body);
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .article-meta .dot { color: var(--border); }
    
    h1 { font-size: 2.4rem; font-weight: 700; line-height: 1.2; margin: 1.6em 0 0.8em; letter-spacing: -0.02em; }
    h2 { font-size: 1.8rem; font-weight: 700; line-height: 1.3; margin: 1.4em 0 0.6em; letter-spacing: -0.01em; }
    h3 { font-family: var(--font-body); font-size: 1.3rem; font-weight: 600; margin: 1.2em 0 0.5em; }
    p { margin-bottom: 1.4em; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    mark { background: rgba(200, 145, 46, 0.2); padding: 0 2px; border-radius: 2px; }
    a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
    
    blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 1.4em;
      margin: 2em 0;
      font-style: italic;
      color: var(--text-muted);
      font-size: 1.1em;
    }
    
    ul, ol { padding-left: 1.8em; margin-bottom: 1.4em; }
    li { margin-bottom: 0.4em; }
    ul li::marker { color: var(--accent); }
    ol li::marker { color: var(--accent); font-family: var(--font-body); }
    
    code { font-family: var(--font-mono); font-size: 0.875em; background: var(--bg-code); padding: 0.15em 0.4em; border-radius: 4px; color: #c7254e; }
    
    pre {
      background: #1a1a2e;
      border-radius: 8px;
      padding: 1.4em;
      overflow-x: auto;
      margin: 1.5em 0;
    }
    
    pre code { background: none; color: #e0e0e0; padding: 0; font-size: 0.9em; }
    
    hr { border: none; border-top: 1px solid var(--border); margin: 2.5em 0; }
    
    img { max-width: 100%; border-radius: 8px; display: block; margin: 1.5em auto; }
    
    /* Custom block styles */
    .koenig-image-block { margin: 2em 0; }
    .koenig-image-block img { width: 100%; }
    .koenig-image-block figcaption { text-align: center; font-family: var(--font-body); font-size: 0.875rem; color: var(--text-muted); margin-top: 0.75em; font-style: italic; }
    
    .koenig-embed-block { margin: 2em 0; }
    .koenig-embed-block iframe { width: 100%; border-radius: 8px; border: none; aspect-ratio: 16/9; }
    
    .koenig-callout {
      display: flex;
      gap: 1em;
      padding: 1.2em 1.4em;
      border-radius: 8px;
      margin: 1.5em 0;
    }
    .koenig-callout.info { background: #e8f4f8; border-left: 4px solid #4a9eff; }
    .koenig-callout.warning { background: #fef9e7; border-left: 4px solid #f59e0b; }
    .koenig-callout.success { background: #e8f8ed; border-left: 4px solid #52c97a; }
    .koenig-callout.danger { background: #fde8e8; border-left: 4px solid #e05555; }
    .koenig-callout-icon { font-size: 1.4em; flex-shrink: 0; }
    .koenig-callout-content { flex: 1; }
    
    .koenig-button-block { margin: 2em 0; text-align: center; }
    .koenig-button {
      display: inline-block;
      padding: 0.75em 2em;
      background: var(--accent);
      color: white;
      border-radius: 6px;
      text-decoration: none;
      font-family: var(--font-body);
      font-weight: 600;
    }
    
    .koenig-toggle { border: 1px solid var(--border); border-radius: 8px; margin: 1.5em 0; }
    .koenig-toggle summary { padding: 1em 1.2em; cursor: pointer; font-family: var(--font-body); font-weight: 600; list-style: none; }
    .koenig-toggle summary::before { content: '▶ '; font-size: 0.7em; }
    details[open] .koenig-toggle summary::before { content: '▼ '; }
    .koenig-toggle-content { padding: 0 1.2em 1em; }
    
    .koenig-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5em; margin: 2em 0; }
    .koenig-gallery img { width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin: 0; }
    
    .koenig-audio { margin: 2em 0; }
    .koenig-audio audio { width: 100%; }
    
    @media (max-width: 640px) {
      body { font-size: 16px; padding: 24px 16px; }
      h1 { font-size: 1.8rem; }
      h2 { font-size: 1.4rem; }
    }
    
    @media print {
      body { padding: 0; }
      .koenig-embed-block iframe { display: none; }
    }
  </style>
</head>
<body>
  <article>
    <div class="article-meta">
      <span>Exported with Koenig Editor</span>
      <span class="dot">·</span>
      <span>${timestamp}</span>
    </div>
    ${processedContent}
  </article>
</body>
</html>`;
}

/**
 * Converts a custom block object to its HTML representation for export
 */
function renderBlockToHtml(block: BlockData): string {
  switch (block.type) {
    case "image": {
      const { src, alt, caption, width } = block.data as { src: string; alt: string; caption: string; width: string };
      const widthStyle = width === "wide" ? "max-width: 900px; margin-left: auto; margin-right: auto;" : "";
      return `<figure class="koenig-image-block" style="${widthStyle}">
        <img src="${src}" alt="${escapeHtml(alt || "")}" />
        ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}
      </figure>`;
    }
    
    case "gallery": {
      const { images } = block.data as { images: Array<{ src: string; alt: string }> };
      const imgs = (images || []).map(img => `<img src="${img.src}" alt="${escapeHtml(img.alt || "")}" />`).join("\n");
      return `<div class="koenig-gallery">${imgs}</div>`;
    }
    
    case "embed": {
      const { url, embedHtml, caption } = block.data as { url: string; embedHtml: string; caption: string };
      if (embedHtml) {
        return `<div class="koenig-embed-block">${embedHtml}${caption ? `<p style="text-align:center;font-size:0.875rem;color:#666;margin-top:0.5em">${escapeHtml(caption)}</p>` : ""}</div>`;
      }
      return `<div class="koenig-embed-block"><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p></div>`;
    }
    
    case "callout": {
      const { text, emoji, variant } = block.data as { text: string; emoji: string; variant: string };
      return `<div class="koenig-callout ${variant || "info"}">
        <span class="koenig-callout-icon">${emoji || "💡"}</span>
        <div class="koenig-callout-content">${text}</div>
      </div>`;
    }
    
    case "button": {
      const { text, url, alignment } = block.data as { text: string; url: string; alignment: string };
      return `<div class="koenig-button-block" style="text-align:${alignment || "center"}">
        <a class="koenig-button" href="${escapeHtml(url || "#")}">${escapeHtml(text || "Click here")}</a>
      </div>`;
    }
    
    case "toggle": {
      const { heading, content } = block.data as { heading: string; content: string };
      return `<details class="koenig-toggle">
        <summary class="koenig-toggle">${escapeHtml(heading || "Toggle")}</summary>
        <div class="koenig-toggle-content">${content || ""}</div>
      </details>`;
    }
    
    case "html": {
      const { html } = block.data as { html: string };
      return html || "";
    }
    
    case "markdown": {
      const { content: md } = block.data as { content: string };
      // Simple markdown to HTML conversion for export
      const html = simpleMarkdownToHtml(md || "");
      return `<div class="koenig-markdown">${html}</div>`;
    }
    
    case "audio": {
      const { src, title } = block.data as { src: string; title: string };
      return `<div class="koenig-audio">
        ${title ? `<p style="font-family:'DM Sans',sans-serif;font-weight:600;margin-bottom:0.5em">${escapeHtml(title)}</p>` : ""}
        <audio controls src="${escapeHtml(src)}"></audio>
      </div>`;
    }
    
    case "video": {
      const { src, poster } = block.data as { src: string; poster: string };
      return `<video controls style="width:100%;border-radius:8px;margin:2em 0" poster="${escapeHtml(poster || "")}" src="${escapeHtml(src)}"></video>`;
    }
    
    default:
      return `<!-- Unknown block type: ${block.type} -->`;
  }
}

/** Basic markdown-to-HTML for export (handles common patterns) */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

/** Escape HTML special characters to prevent XSS in exported attributes */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Triggers a browser download of the generated HTML file
 * @param html - The complete HTML string to download
 * @param filename - Desired filename (without extension)
 */
export function downloadHtmlFile(html: string, filename: string = "article"): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename.replace(/[^a-z0-9-_]/gi, "-").toLowerCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
