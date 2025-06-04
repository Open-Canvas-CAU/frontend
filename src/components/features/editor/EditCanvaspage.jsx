// // src/components/editor/EditCanvasPage.jsx
// import React, { useState }     from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import SectionPlaceholder      from './SectionPlaceholder'
// import EditorSection          from './EditorSection'
//
// export default function EditCanvasPage() {
//     const { docId } = useParams()
//     const navigate  = useNavigate()
//
//     // 실제 API에서 받아온 값을 useState로 관리한다고 가정
//     const [previewText] = useState(
//         'Lorem ipsum dolor sit amet consectetur.'
//     )
//     const [body, setBody] = useState(
//         `<p>Lorem ipsum dolor sit amet consectetur. Et erat pharetra vulputate lectus amet semper luctus suspendisse ac. ...</p>`
//     )
//
//     const updatedAt = '25.04.21 오후 4:30 마지막 수정'
//
//     const goBack = () => navigate(-1)
//     const handleSave = () => {
//         // TODO: API로 변경사항 저장
//         console.log('saving', { docId, body })
//     }
//
//     return (
//         <div className="min-h-screen py-3">
//             <div className="container mx-auto bg-white rounded-tl-3xl shadow overflow-hidden">
//                 {/* 헤더: 뒤로가기 + 제목 자리(없으면 공간 유지) + 수정 시간 */}
//                 <div className="flex items-center justify-between px-6 py-4 border-b">
//                     <button
//                         onClick={goBack}
//                         className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
//                     >
//                         <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
//                         <span>뒤로 가기</span>
//                     </button>
//                     <div /> {/* 가운데 빈 스페이서 */}
//                     <span className="text-base font-medium text-zinc-500">{updatedAt}</span>
//                 </div>
//
//                 <div className="p-6 space-y-8">
//                     {/* 1) 고정 미리보기 섹션 */}
//                     <div className="flex flex-col md:flex-row items-start gap-6">
//                         <SectionPlaceholder className="flex-none w-40 h-24 md:w-56 md:h-32 rounded-xl" />
//                         <p className="flex-1 text-2xl md:text-3xl font-medium text-black leading-relaxed">
//                             {previewText}
//                         </p>
//                     </div>
//
//                     {/* 2) 본문 에디터 */}
//                     <EditorSection
//                         content={body}
//                         onChange={setBody}
//                         readOnly={!isEditing}
//                         className="min-h-[300px] border border-gray-200 rounded-lg p-4"
//                     />
//
//                     {/* 3) 저장 버튼 */}
//                     <div className="flex justify-end">
//                         <button
//                             onClick={handleSave}
//                             className="px-6 py-3 bg-blue-500 hover:bg-blue-600 transition rounded-full text-white font-semibold"
//                         >
//                             저장하기
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
