// src/components/features/illustration/IllustrationGenerator.jsx
import React, { useState } from 'react'
import { illustrationService } from '@/services/illustrationService'

export default function IllustrationGenerator({ 
  isOpen, 
  onClose, 
  onImageGenerated,
  initialData = {} 
}) {
  const [loading, setLoading] = useState(false)
  const [imageData, setImageData] = useState({
    title: initialData.title || '',
    genres: initialData.genres || [],
    content: initialData.content || '',
    postId: initialData.postId || '',
    ...initialData
  })
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [error, setError] = useState(null)

  // 사전 정의된 장르 목록
  const AVAILABLE_GENRES = [
    '판타지', 'SF', '로맨스', '스릴러', '미스터리', 
    '액션', '모험', '코미디', '드라마', '호러',
    '역사', '전쟁', '스팀펑크', '사이버펑크', '디스토피아'
  ]

  const handleInputChange = (field, value) => {
    setImageData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleGenreToggle = (genre) => {
    setImageData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const generateIllustration = async () => {
    if (!imageData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('🎨 일러스트 생성 시작:', imageData)
      
      const imageUrl = await illustrationService.generateAndSaveCoverImage(imageData)
      
      setGeneratedImageUrl(imageUrl)
      
      // 부모 컴포넌트에 생성된 이미지 URL 전달
      if (onImageGenerated) {
        onImageGenerated(imageUrl, imageData)
      }
      
    } catch (err) {
      console.error('일러스트 생성 실패:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndClose = () => {
    if (generatedImageUrl && onImageGenerated) {
      onImageGenerated(generatedImageUrl, imageData)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎨 AI 일러스트 생성</h2>
              <p className="opacity-90">작품에 어울리는 커버 이미지를 AI로 생성해보세요</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 폼 */}
        <div className="p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작품 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={imageData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="작품의 제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* 장르 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              장르 선택 (복수 선택 가능)
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    imageData.genres.includes(genre)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {imageData.genres.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                선택된 장르: {imageData.genres.join(', ')}
              </p>
            )}
          </div>

          {/* 내용 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작품 내용 (선택)
            </label>
            <textarea
              value={imageData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="작품의 내용이나 분위기를 간단히 설명해주세요. AI가 더 정확한 이미지를 생성할 수 있습니다."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows="4"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* 생성된 이미지 미리보기 */}
          {generatedImageUrl && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">🎉 생성된 일러스트</h3>
              <div className="relative">
                <img 
                  src={generatedImageUrl} 
                  alt="생성된 커버 이미지"
                  className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    console.error('이미지 로드 실패:', generatedImageUrl)
                    e.target.src = illustrationService.getDefaultImageUrl(imageData.postId, imageData.title)
                  }}
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs">
                  ✅ 생성 완료
                </div>
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={generateIllustration}
              disabled={loading || !imageData.title.trim()}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                loading || !imageData.title.trim()
                  ? 'bg-red-300 text-red-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI가 그리는 중...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🎨</span>
                  <span>{generatedImageUrl ? '다시 생성하기' : '일러스트 생성'}</span>
                </div>
              )}
            </button>

            {generatedImageUrl && (
              <button
                onClick={handleSaveAndClose}
                className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>사용하기</span>
                </div>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 일러스트 생성 팁</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 구체적인 장르를 선택하면 더 정확한 이미지가 생성됩니다</li>
              <li>• 작품 내용에 분위기나 주요 요소를 포함하면 도움이 됩니다</li>
              <li>• 생성에는 10-30초 정도 소요될 수 있습니다</li>
              <li>• 마음에 들지 않으면 다시 생성할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}