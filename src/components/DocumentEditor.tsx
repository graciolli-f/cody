import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import CodeBlock from '@tiptap/extension-code-block'
import { 
  Bold, 
  Italic, 
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

interface DocumentEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  placeholder?: string
}

export default function DocumentEditor({ 
  content, 
  onChange, 
  editable = true, 
  placeholder = 'Start writing...' 
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the standalone CodeBlock extension
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Link.configure({
        openOnClick: false,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  const ToolbarButton: React.FC<{
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }> = ({ onClick, isActive = false, disabled = false, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {editable && (
        <div className="border-b border-gray-200 bg-gray-50 p-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text formatting */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Block elements */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-gray max-w-none focus:outline-none"
        />
      </div>
    </div>
  )
} 