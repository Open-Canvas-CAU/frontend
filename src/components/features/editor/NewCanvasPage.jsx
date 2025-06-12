// src/components/features/editor/NewCanvasPage.jsx - 일러스트 생성 기능 추가
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeInput from './ThemeInput';
import EditorSection from './EditorSection';
import IllustrationGenerator from '../illustration/IllustrationGenerator';
import { illustrationService } from '@/services/illustrationService';
import { recommendService } from '@/services/recommendService';
import { authService } from '@/services/authService';
import api from '@/services/api';

export default function NewCanvasPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [limit, setLimit] = useState(5);
  const [genres, setGenres] = useState([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [step, setStep] = useState(1);
  
  // 일러스트 생성 관련 상태
  const [showIllustrationModal, setShowIllustrationModal] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);

  // 사전 정의된 장르 목록
  const AVAILABLE_GENRES = [
    '판타지', 'SF', '로맨스', '스릴러', '미스터리', 
    '액션', '모험', '코미디', '드라마', '호러',
    '역사', '전쟁', '스팀펑크', '사이버펑크', '디스토피아'
  ];

  const handleGenreToggle = (genre) => {
    setGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleImageGenerated = (imageUrl, imageData) => {
    setCoverImageUrl(imageUrl);
    setHasCustomImage(true);
    setShowIllustrationModal(false);
    
    // 생성된 이미지 데이터로 폼 정보도 업데이트
    if (imageData.genres && imageData.genres.length > 0) {
      setGenres(imageData.genres);
    }
  };

  // 1. 일반 '캔버스 생성하기' (작업 중 상태로 생성)
  const handleCreate = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('캔버스 생성 중...');

    try {
      const currentUser = authService.getCurrentUser();
      
      // 커버 생성
      setLoadingMessage('표지 정보 생성 중...');
      const coverDto = { 
        title, 
        coverImageUrl: coverImageUrl || `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(title)}`, 
        time: new Date().toISOString(), 
        limit 
      };
      const coverRes = await api.post('/api/covers', coverDto);
      const createdCover = coverRes.data;

      // AI 일러스트 생성 (백그라운드에서 처리)
      if (!hasCustomImage && title.trim()) {
        setLoadingMessage('AI 일러스트 생성 중...');
        try {
          const generatedImageUrl = await illustrationService.generateAndSaveCoverImage({
            postId: createdCover.id,
            title,
            genres,
            content: body || title
          });
          
          // 생성된 이미지로 커버 업데이트 (별도 API 필요 시)
          setCoverImageUrl(generatedImageUrl);
          console.log('✅ AI 일러스트 생성 완료:', generatedImageUrl);
        } catch (imgError) {
          console.warn('⚠️ AI 일러스트 생성 실패 (기본 이미지 사용):', imgError.message);
        }
      }

      // 문서방 생성 (처음 글 포함)
      setLoadingMessage('편집 공간 마련 중...');
      const initialDto = {
        title,
        body: body || '<p>새로운 캔버스가 시작되었습니다.</p>',
        depth: 0,
        siblingIndex: 0,
        time: new Date().toISOString()
      };
      const roomRes = await api.post('/api/rooms/create', initialDto);
      const roomData = roomRes.data;
      if (!roomData?.roomId) throw new Error('Room ID를 반환받지 못했습니다.');

      // 추천시스템 연동
      setLoadingMessage('추천시스템 연동 중...');
      if (currentUser?.id) {
        await recommendService.onCanvasCreated({
          coverId: createdCover.id,
          title,
          content: body,
          genres
        }, currentUser.id);
      }

      // 이동
      setStep(3);
      setLoadingMessage('편집 페이지로 이동 중...');
      setTimeout(() => navigate(`/editor/${roomData.roomId}/edit`), 1000);
      
    } catch (err) {
      console.error('캔버스 생성 실패:', err);
      alert(`캔버스 생성 실패: ${err.response?.data?.message || err.message}`);
      setIsLoading(false);
    }
  };

  // 2. '완성작으로 생성' (즉시 종료 후 완성본 생성)
  const handleCreateAsCompleted = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentUser = authService.getCurrentUser();
      
      // 커버 생성
      setLoadingMessage('1/4: 표지 생성 중...');
      const coverDto = { 
        title, 
        coverImageUrl: coverImageUrl || `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(title)}`, 
        time: new Date().toISOString(), 
        limit 
      };
      const coverRes = await api.post('/api/covers', coverDto);
      const createdCover = coverRes.data;
      if (!createdCover?.id) throw new Error('커버 생성 실패');

      // AI 일러스트 생성
      if (!hasCustomImage && title.trim()) {
        setLoadingMessage('2/4: AI 일러스트 생성 중...');
        try {
          const generatedImageUrl = await illustrationService.generateAndSaveCoverImage({
            postId: createdCover.id,
            title,
            genres,
            content: body || title
          });
          setCoverImageUrl(generatedImageUrl);
          console.log('✅ AI 일러스트 생성 완료:', generatedImageUrl);
        } catch (imgError) {
          console.warn('⚠️ AI 일러스트 생성 실패:', imgError.message);
        }
      }

      // 문서방 생성
      setLoadingMessage('3/4: 문서방 생성 중...');
      const initialDto = {
        title,
        body: body || `<h1>${title}</h1><p>완성된 이야기입니다.</p>`,
        depth: 0,
        siblingIndex: 0,
        time: new Date().toISOString()
      };
      const roomRes = await api.post('/api/rooms/create', initialDto);
      const roomData = roomRes.data;
      if (!roomData?.roomId) throw new Error('Room 생성 실패');

      // 방 종료 및 저장 (완성본 생성)
      setLoadingMessage('4/4: 완성본 저장 중...');
      await api.post('/api/rooms/exit', { roomId: roomData.roomId, writingDtos: roomData.writingDtos });

      // 추천시스템 연동
      if (currentUser?.id) {
        await recommendService.onCanvasCreated({
          coverId: createdCover.id,
          title,
          content: body,
          genres
        }, currentUser.id);
      }

      setStep(3);
      setLoadingMessage('완성작 생성 완료! 페이지로 이동합니다.');
      setTimeout(() => navigate(`/completed/${createdCover.id}`), 1500);
      
    } catch (err) {
      console.error('완성작 생성 실패:', err);
      alert(`완성작 생성 실패: ${err.response?.data?.message || err.message}`);
      setIsLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="text-6xl text-purple-600">🎉</div>
          <h2 className="text-3xl font-bold">생성이 완료되었습니다!</h2>
          <p className="text-lg">{loadingMessage}</p>
          {hasCustomImage && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">생성된 커버 이미지:</p>
              <img 
                src={coverImageUrl} 
                alt="생성된 커버" 
                className="w-32 h-24 object-cover rounded-lg mx-auto shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">새 캔버스</h1>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* 1. 제목 입력 */}
          <div className="border border-white/20 rounded-lg p-6">
            <label className="block text-white mb-2 text-lg">컨셉 정하기</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="이야기의 컨셉을 입력하세요" 
              className="w-full bg-black border border-white/20 rounded p-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 text-lg"
            />
          </div>
          
          {/* 2. 장르 선택 */}
          <div className="border border-white/20 rounded-lg p-6">
            <label className="block text-white mb-2 text-lg">장르 선택</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    genres.includes(genre)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          {/* 3. 최대 작가 수 */}
          <div className="border border-white/20 rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white text-lg">최대 작가 수</label>
              <span className="text-white/70 text-lg">{limit}명</span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={10} 
              value={limit} 
              onChange={e => setLimit(Number(e.target.value))} 
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-sm text-white/50 mt-1">
              <span>1명</span>
              <span>10명</span>
            </div>
            <p className="text-sm text-white/50 mt-2">함께 작업할 수 있는 최대 인원 수</p>
          </div>
          
          {/* 4. 초기 본문 */}
          <div className="border border-white/20 rounded-lg p-6">
            <label className="block text-white mb-2 text-lg">시작 이야기 (선택)</label>
            <EditorSection 
              content={body} 
              onChange={setBody} 
              readOnly={false} 
              className="bg-black border border-white/20 rounded p-4 min-h-[200px] text-white" 
            />
          </div>
          
          {/* 5. 일러스트 생성 옵션 */}
          <div className="border border-white/20 rounded-lg p-6">
            <label className="block text-white mb-2 text-lg">커버 일러스트</label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="generateIllustration"
                  checked={!hasCustomImage}
                  onChange={(e) => setHasCustomImage(!e.target.checked)}
                  className="w-5 h-5 text-red-500 bg-black border-white/20 rounded focus:ring-red-500"
                />
                <label htmlFor="generateIllustration" className="text-white text-lg">
                  AI로 일러스트 자동 생성하기
                </label>
              </div>
              
              {!hasCustomImage && (
                <div className="text-sm text-white/70">
                  제목과 장르를 기반으로 AI가 일러스트를 생성합니다.
                </div>
              )}
              
              {hasCustomImage && coverImageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-white/70 mb-2">현재 커버 이미지:</p>
                  <img 
                    src={coverImageUrl} 
                    alt="커버 이미지" 
                    className="w-40 h-30 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* 버튼 */}
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10"
            >
              취소
            </button>
            <button 
              onClick={handleCreate} 
              disabled={isLoading || !title.trim()} 
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              캔버스 생성하기
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <div className="text-6xl animate-spin">🎨</div>
              <p className="text-xl text-white">{loadingMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}