import React from 'react'
import SlateEditor from './SlateEditor'

/**
 * @param {string} content 
 * @param {fn}     onChange  
 * @param {bool}   readOnly   
 * @param {string} className  
 */
export default function EditorSection({
  content,
  onChange,
  readOnly,
  className = '',
}) {
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