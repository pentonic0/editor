# Koenig Editor — Next.js Rich Content Editor

A feature-complete rich content editor inspired by Ghost CMS's Koenig Editor, built with Next.js 15 and TipTap.

## Features

### Text Formatting
- **Markdown shortcuts**: Type `# ` for H1, `## ` for H2, `**bold**`, `*italic*`, `` `code` ``, `> ` for blockquote, `- ` for lists
- **Floating toolbar**: Appears when text is selected — Bold, Italic, Underline, Highlight, Blockquote, H2/H3, Link
- **Keyboard shortcuts**: ⌘B bold, ⌘I italic, ⌘U underline, ⌘Z undo, ⌘⇧Z redo

### Rich Content Blocks (click the `+` button)
| Block | Description |
|-------|-------------|
| 🖼️ Image | Upload with drag-and-drop, caption, width variants (normal/wide/full) |
| 🗂️ Gallery | Multi-image grid with 2/3/4 column options |
| 🎬 Video | Upload video files with optional poster image |
| 🎵 Audio | Upload audio files with title/artist metadata |
| 🔗 Embed | YouTube, Spotify, Twitter/X, CodePen auto-detection |
| 💡 Callout | Info/Warning/Success/Danger variants with custom emoji |
| ▶️ Toggle | Collapsible section with editable heading and body |
| 🔘 Button | CTA button with URL, alignment, and style variants |
| 💻 HTML | Raw HTML editor with live preview (split-pane) |
| 📝 Markdown | Markdown editor with live preview |
| ➖ Divider | Horizontal rule separator |

### Other Features
- **Drag & drop reordering** of blocks (grab the ⠿ handle on the left)
- **Emoji autocomplete**: Type `:smile` → dropdown with emoji suggestions
- **Post history**: Auto-saves every 2s; click 🕐 History to browse and restore
- **Export HTML**: Downloads a clean standalone `.html` file preserving all content
- Word count and block count in the header

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx                    # Entry point (dynamic import of editor)
├── layout.tsx                  # HTML shell + metadata
├── globals.css                 # Design tokens, TipTap styles, animations
├── components/
│   ├── editor/
│   │   └── KoenigEditor.tsx    # Main orchestrator component
│   ├── blocks/
│   │   ├── ImageBlock.tsx      # Image upload + caption + width
│   │   ├── GalleryBlock.tsx    # Multi-image grid
│   │   ├── EmbedBlock.tsx      # URL → rich embed
│   │   ├── CalloutBlock.tsx    # Highlighted callout box
│   │   ├── ToggleBlock.tsx     # Collapsible accordion
│   │   ├── ButtonBlock.tsx     # CTA button
│   │   ├── HtmlBlock.tsx       # HTML/Markdown editor
│   │   └── MediaBlocks.tsx     # AudioBlock + VideoBlock
│   ├── toolbar/
│   │   ├── FloatingToolbar.tsx # Floating selection toolbar
│   │   └── BlockInserter.tsx   # "+" block insertion menu
│   └── ui/
│       ├── HistoryPanel.tsx    # Sidebar revision history
│       └── EmojiPicker.tsx     # Emoji autocomplete popup
├── hooks/
│   └── usePostHistory.ts       # Debounced snapshot management
└── utils/
    ├── exportHtml.ts           # Standalone HTML generation + download
    └── emojiData.ts            # Emoji list + search + trigger detection
```

## Key Technical Decisions

- **TipTap** for the rich text core — ProseMirror-based, extensible, accessible
- **lowlight** for syntax-highlighted code blocks (server-safe, no eval)
- **@hello-pangea/dnd** for drag-and-drop (React 18 compatible fork of react-beautiful-dnd)
- **No publish button** — replaced with Export HTML that creates a fully self-contained file
- Files are converted to base64 for true portability in exported HTML
