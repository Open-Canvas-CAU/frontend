// src/components/features/editor/NewCanvasPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeInput from './ThemeInput';
import EditorSection from './EditorSection';
import api from '@/services/api';

export default function NewCanvasPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [limit, setLimit] = useState(5);
  const [genres, setGenres] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [step, setStep] = useState(1);

  // 1. 일반 '캔버스 생성하기' (작업 중 상태로 생성)
  const handleCreate = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('캔버스 생성 중...');

    try {
      // 커버 생성
      setLoadingMessage('표지 정보 생성 중...');
      const coverDto = { title, coverImageUrl: `https://via.placeholder.com/400x300?text=${encodeURIComponent(title)}`, time: new Date().toISOString(), limit };
      const coverRes = await api.post('/api/covers', coverDto);
      const createdCover = coverRes.data;

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
      // 커버 생성
      setLoadingMessage('1/3: 표지 생성 중...');
      const coverDto = { title, coverImageUrl: `https://via.placeholder.com/400x300?text=${encodeURIComponent(title)}`, time: new Date().toISOString(), limit };
      const coverRes = await api.post('/api/covers', coverDto);
      const createdCover = coverRes.data;
      if (!createdCover?.id) throw new Error('커버 생성 실패');

      // 문서방 생성
      setLoadingMessage('2/3: 문서방 생성 중...');
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
      setLoadingMessage('3/3: 완성본 저장 중...');
      // roomData.writingDtos 포함
      await api.post('/api/rooms/exit', { roomId: roomData.roomId, writingDtos: roomData.writingDtos });

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
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="text-center space-y-4">
          <div className="text-6xl text-green-600">🎉</div>
          <h2 className="text-3xl font-bold">생성이 완료되었습니다!</h2>
          <p className="text-lg">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">새 캔버스 만들기</h1>
        {/* 1. 제목 */}
        <div>
          <label className="block text-gray-700">제목<span className="text-red-500">*</span></label>
          <ThemeInput value={title} onChange={setTitle} placeholder="캔버스 제목" />
        </div>
        {/* 2. 제한 */}
        <div>
          <label className="block text-gray-700">최대 작가 수</label>
          <input type="number" min={1} max={10} value={limit} onChange={e => setLimit(Number(e.target.value))} className="border rounded p-2 w-20" />
        </div>
        {/* 3. 장르 */}
        <div>
          <label className="block text-gray-700">장르 (쉼표 구분)</label>
          <ThemeInput value={genres} onChange={setGenres} placeholder="예: 판타지, SF" />
        </div>
        {/* 4. 초기 본문 */}
        <div>
          <label className="block text-gray-700">시작 이야기 (선택)</label>
          <EditorSection content={body} onChange={setBody} readOnly={false} className="border rounded p-2 min-h-[150px]" />
        </div>
        {/* 버튼 */}
        <div className="flex justify-end space-x-4">
          <button onClick={() => navigate(-1)} className="px-6 py-2 border rounded">취소</button>
          <button onClick={handleCreateAsCompleted} disabled={isLoading || !title.trim()} className="px-6 py-2 bg-green-500 text-white rounded disabled:opacity-50">완성작으로 생성</button>
          <button onClick={handleCreate} disabled={isLoading || !title.trim()} className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50">작업용 캔버스 생성</button>
        </div>
      </div>
    </div>
  );
}
