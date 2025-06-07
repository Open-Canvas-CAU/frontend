// src/components/editor/EditorSection.jsx
import React from 'react'
import SlateEditor from './SlateEditor'

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
            <SlateEditor
                initialContent={content}
                onChange={onChange}
                readOnly={readOnly}
                placeholder={readOnly ? '' : '이야기를 작성해보세요...'}
            />
        </div>
    )
}