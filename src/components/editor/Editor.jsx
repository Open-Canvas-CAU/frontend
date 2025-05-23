// src/components/editor/Editor.jsx
import React, { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function Editor({
                                   initialContent = '',
                                   onChange,
                                   editable = true,
                               }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent,
        editable,             // only used at init
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    })

    // <-- this makes editable truly dynamic
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable)
        }
    }, [editor, editable])

    if (!editor) return null
    return (
        <div className="prose">
            <EditorContent editor={editor} />
        </div>
    )
}
