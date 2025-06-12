// src/components/editor/SlateEditor.jsx
import React, { useMemo, useCallback, useState } from 'react'
import { createEditor, Transforms, Editor, Text } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'

// 커스텀 헬퍼 함수들
const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  },

  isItalicMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.italic === true : false
  },

  isUnderlineMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.underline === true : false
  },

  isBlockActive(editor, format) {
    const { selection } = editor
    if (!selection) return false

    const [match] = Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) && Editor.isBlock(editor, n) && n.type === format,
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'italic')
    } else {
      Editor.addMark(editor, 'italic', true)
    }
  },

  toggleUnderlineMark(editor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'underline')
    } else {
      Editor.addMark(editor, 'underline', true)
    }
  },

  toggleBlock(editor, format) {
    const isActive = CustomEditor.isBlockActive(editor, format)
    const newProperties = {
      type: isActive ? 'paragraph' : format,
    }
    Transforms.setNodes(editor, newProperties)
  },
}

// 툴바 버튼 컴포넌트
const ToolbarButton = ({ format, icon, type = 'mark' }) => {
  const editor = useSlate()
  
  const isActive = type === 'mark' 
    ? CustomEditor[`is${format.charAt(0).toUpperCase() + format.slice(1)}MarkActive`](editor)
    : CustomEditor.isBlockActive(editor, format)

  const handleClick = (e) => {
    e.preventDefault()
    if (type === 'mark') {
      CustomEditor[`toggle${format.charAt(0).toUpperCase() + format.slice(1)}Mark`](editor)
    } else {
      CustomEditor.toggleBlock(editor, format)
    }
  }

  return (
    <button
      className={`px-3 py-1 rounded ${
        isActive ? 'bg-black-300' : 'hover:bg-black-100'
      }`}
      onMouseDown={handleClick}
    >
      {icon}
    </button>
  )
}

// 툴바 컴포넌트
const Toolbar = () => {
  return (
    <div className="flex gap-1 p-2 border-b border-white-300 bg-black-50">
      <ToolbarButton format="bold" icon="B" />
      <ToolbarButton format="italic" icon="I" />
      <ToolbarButton format="underline" icon="U" />
      <div className="w-px bg-black-300 mx-1" />
      <ToolbarButton format="heading-one" icon="H1" type="block" />
      <ToolbarButton format="heading-two" icon="H2" type="block" />
      <ToolbarButton format="block-quote" icon="❝" type="block" />
      <ToolbarButton format="numbered-list" icon="1." type="block" />
      <ToolbarButton format="bulleted-list" icon="•" type="block" />
    </div>
  )
}

// Element 렌더러
const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote className="border-l-4 border-white-300 pl-4 italic" {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul className="list-disc list-inside" {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 className="text-3xl font-bold my-4" {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 className="text-2xl font-bold my-3" {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol className="list-decimal list-inside" {...attributes}>{children}</ol>
    default:
      return <p className="my-2" {...attributes}>{children}</p>
  }
}

// Leaf 렌더러
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

// 메인 에디터 컴포넌트
const SlateEditor = ({ 
  initialContent = '', 
  onChange, 
  readOnly = false,
  placeholder = '내용을 입력하세요...',
  className = ''
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  
  // HTML을 Slate 형식으로 변환
  const deserializeHtml = (html) => {
    if (!html || html === '<p><br></p>' || html === '') {
      return [{ type: 'paragraph', children: [{ text: '' }] }]
    }
    
    // 간단한 HTML 파싱 (실제로는 더 복잡한 파서가 필요할 수 있음)
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const result = []
    
    doc.body.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        result.push({ type: 'paragraph', children: [{ text: node.textContent }] })
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = [{ text: node.textContent }]
        switch (node.tagName.toLowerCase()) {
          case 'h1':
            result.push({ type: 'heading-one', children })
            break
          case 'h2':
            result.push({ type: 'heading-two', children })
            break
          case 'blockquote':
            result.push({ type: 'block-quote', children })
            break
          case 'ul':
            node.childNodes.forEach(li => {
              if (li.tagName?.toLowerCase() === 'li') {
                result.push({ type: 'list-item', children: [{ text: li.textContent }] })
              }
            })
            break
          default:
            result.push({ type: 'paragraph', children })
        }
      }
    })
    
    return result.length > 0 ? result : [{ type: 'paragraph', children: [{ text: '' }] }]
  }

  // Slate 형식을 HTML로 변환
  const serializeHtml = (nodes) => {
    return nodes.map(n => {
      if (Text.isText(n)) {
        let text = n.text
        if (n.bold) text = `<strong>${text}</strong>`
        if (n.italic) text = `<em>${text}</em>`
        if (n.underline) text = `<u>${text}</u>`
        return text
      }

      const children = n.children.map(child => serializeHtml([child])).join('')

      switch (n.type) {
        case 'heading-one':
          return `<h1>${children}</h1>`
        case 'heading-two':
          return `<h2>${children}</h2>`
        case 'block-quote':
          return `<blockquote>${children}</blockquote>`
        case 'list-item':
          return `<li>${children}</li>`
        case 'bulleted-list':
          return `<ul>${children}</ul>`
        case 'numbered-list':
          return `<ol>${children}</ol>`
        default:
          return `<p>${children}</p>`
      }
    }).join('')
  }

  const [value, setValue] = useState(deserializeHtml(initialContent))

  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const handleChange = (newValue) => {
    setValue(newValue)
    if (onChange) {
      const html = serializeHtml(newValue)
      onChange(html)
    }
  }

  return (
    <div className={`flex flex-col border border-white-300 rounded-lg overflow-hidden ${className}`}>
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        {!readOnly && <Toolbar />}
        <div className="p-4 min-h-[300px]">
          <Editable
            className="relative flex-1 outline-none"
            style={{ minHeight: 0 }}
            readOnly={readOnly}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            // placeholder={placeholder}
            spellCheck
            autoFocus
            onKeyDown={(event) => {
              if (!event.ctrlKey) return

              switch (event.key) {
                case 'b': {
                  event.preventDefault()
                  CustomEditor.toggleBoldMark(editor)
                  break
                }
                case 'i': {
                  event.preventDefault()
                  CustomEditor.toggleItalicMark(editor)
                  break
                }
                case 'u': {
                  event.preventDefault()
                  CustomEditor.toggleUnderlineMark(editor)
                  break
                }
              }
            }}
          />
        </div>
      </Slate>
    </div>
  )
}

export default SlateEditor