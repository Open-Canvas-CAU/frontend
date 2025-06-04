import React from 'react'
import Editor from './Editor'

/**
 * @param {string} content     HTML to display
 * @param {fn}     onChange    called with new HTML
 * @param {bool}   readOnly    if true, editor is not editable
 * @param {string} className   container styles/sizing
 */
export default function EditorSection({
                                          content,
                                          onChange,
                                          readOnly,
                                          className = '',
                                      }) {
    return (
        <div className={className}>
            <Editor
                initialContent={content}
                onChange={onChange}
                editable={!readOnly}
            />
        </div>
    )
}
