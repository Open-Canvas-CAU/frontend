import React from 'react'
import SlateEditor from './SlateEditor'

/**
 * @param {string} content     HTML to display
 * @param {fn}     onChange    Called with new HTML
 * @param {bool}   readOnly    If true, editor is not editable
 * @param {string} className   Container styles/sizing (e.g. "min-h-[300px] border p-4")
 */
export default function EditorSection({
  content,
  onChange,
  readOnly,
  className = '',
}) {
  // SlateEditor 자체가 flex 컨테이너와 스타일을 처리하므로, 여기서는 바로 전달합니다.
  return (
    <SlateEditor
      initialContent={content}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={readOnly ? '' : '이야기를 작성해보세요...'}
      className={className}
    />
  )
}