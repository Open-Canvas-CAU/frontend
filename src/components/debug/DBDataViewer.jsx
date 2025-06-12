// src/components/debug/DBDataViewer.jsx
import React, { useState, useEffect } from 'react';
import { coverService } from '@/services/coverService';
import api from '@/services/api';
import mockDataSeeder from '@/utils/mockDataSeeder';
import completedDataSeeder from '@/utils/completedDataSeeder';


export default function DBDataViewer() {
    const [covers, setCovers] = useState([]);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [seedingStatus, setSeedingStatus] = useState('idle'); // 'idle', 'seeding', 'success', 'error'
    const [seedResult, setSeedResult] = useState(null);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 모든 커버 조회
            const coversResponse = await coverService.getAllCovers();
            console.log('All covers:', coversResponse.data);
            setCovers(coversResponse.data || []);

            // 완성된 커버들의 content 정보 조회
            const completedCovers = coversResponse.data.filter(cover => 
                cover.contentId !== null && cover.contentId !== undefined
            );

            console.log('Completed covers:', completedCovers);

            // 각 완성된 커버의 content 정보 가져오기
            const contentPromises = completedCovers.map(async (cover) => {
                try {
                    const contentResponse = await api.get(`/api/contents/${cover.id}`); // coverId 사용
                    return {
                        coverId: cover.id,
                        contentId: cover.contentId,
                        title: cover.title,
                        content: contentResponse.data
                    };
                } catch (err) {
                    console.warn(`Failed to fetch content for cover ${cover.id}:`, err.message);
                    return {
                        coverId: cover.id,
                        contentId: cover.contentId,
                        title: cover.title,
                        error: err.message
                    };
                }
            });

            const contentResults = await Promise.all(contentPromises);
            console.log('Content results:', contentResults);
            setContents(contentResults);

        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const createTestContent = async () => {
        try {
            // 테스트용 커버 생성
            const testCover = {
                title: "테스트 완성작",
                coverImageUrl: "https://via.placeholder.com/400x300?text=Test+Completed+Canvas",
                time: new Date().toISOString()
            };

            const coverResponse = await api.post('/api/covers', testCover);
            console.log('Test cover created:', coverResponse.data);

            // 생성된 커버 ID로 컨텐츠 조회/생성
            const contentResponse = await api.get(`/api/contents/${coverResponse.data.id}`);
            console.log('Test content created:', contentResponse.data);

            alert(`테스트 데이터 생성 완료!\nCover ID: ${coverResponse.data.id}\nContent ID: ${contentResponse.data.id}`);
            
            // 데이터 다시 로드
            fetchAllData();

        } catch (err) {
            console.error('Failed to create test content:', err);
            alert(`테스트 데이터 생성 실패: ${err.message}`);
        }
    };

    // Mock 데이터 대량 삽입 (작업중 + 완성작 혼합)
    const seedMockData = async () => {
        setSeedingStatus('seeding');
        setSeedResult(null);
        
        try {
            console.log('🌱 Mock 데이터 삽입 시작...');
            const result = await mockDataSeeder.seedAllData();
            
            setSeedingStatus('success');
            setSeedResult(mockDataSeeder.getSummary());
            
            // 데이터 다시 로드
            await fetchAllData();
            
            alert(`Mock 데이터 삽입 완료!\n생성된 커버: ${result.covers.length}개\n완성작: ${result.contents.length}개`);
            
        } catch (err) {
            console.error('Mock 데이터 삽입 실패:', err);
            setSeedingStatus('error');
            setSeedResult({ error: err.message });
            alert(`Mock 데이터 삽입 실패: ${err.message}`);
        }
    };

    // 완성작 데이터 생성
    const createCompletedWorks = async (count = 5) => {
        setSeedingStatus('seeding');
        setSeedResult(null);
        
        try {
            console.log(`🎨 완성작 ${count}개 생성 시작...`);
            completedDataSeeder.reset(); // 기존 결과 초기화
            
            const works = await completedDataSeeder.createCompletedWorks(count);
            
            setSeedingStatus('success');
            setSeedResult(completedDataSeeder.getSummary());
            
            // 데이터 다시 로드
            await fetchAllData();
            
            alert(`완성작 ${works.length}개 생성 완료!\n갤러리 페이지에서 확인해보세요.`);
            
        } catch (err) {
            console.error('완성작 생성 실패:', err);
            setSeedingStatus('error');
            setSeedResult({ error: err.message });
            alert(`완성작 생성 실패: ${err.message}`);
        }
    };

    // 빠른 완성작 1개 생성
    const createQuickWork = async () => {
        setSeedingStatus('seeding');
        
        try {
            const work = await completedDataSeeder.createQuickWork();
            setSeedingStatus('success');
            
            await fetchAllData();
            
            alert(`완성작 생성 완료!\n제목: ${work.title}\nURL: /completed/${work.coverId}`);
            
        } catch (err) {
            console.error('빠른 완성작 생성 실패:', err);
            setSeedingStatus('error');
            alert(`빠른 완성작 생성 실패: ${err.message}`);
        }
    };

    // 테스트 데이터 정리
    const clearTestData = async () => {
        if (!confirm('정말로 모든 테스트 데이터를 삭제하시겠습니까?')) return;
        
        setSeedingStatus('seeding');
        
        try {
            await mockDataSeeder.clearTestData();
            setSeedingStatus('success');
            
            // 데이터 다시 로드
            await fetchAllData();
            
            alert('테스트 데이터 정리 완료!');
            
        } catch (err) {
            console.error('테스트 데이터 정리 실패:', err);
            setSeedingStatus('error');
            alert(`테스트 데이터 정리 실패: ${err.message}`);
        }
    };

    const renderResults = (key, data) => {
        if (!data) return <div className="text-white-500">테스트하지 않음</div>;
        
        return (
            <div className="bg-black-50 p-3 rounded text-xs">
                <pre className="whitespace-pre-wrap overflow-auto max-h-48">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        );
    };

    const deleteAllWritings = async () => {
        if (!confirm('정말로 모든 글을 삭제하시겠습니까?')) return;
        setLoading(true);
        setError(null);
        try {
            // DELETE 메서드로 /api/writings/delete/root 호출
            await api.delete('/api/writings/delete/root');
            alert('✅ 모든 글을 성공적으로 삭제했습니다.');
            await fetchAllData();
        } catch (err) {
            console.error('❌ 전체 글 삭제 실패:', err);
            setError(err.message);
            alert(`삭제 실패: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">DB 데이터 확인 및 Mock 데이터 관리</h1>
                
                {/* 기본 작업 버튼들 */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={deleteAllWritings}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? '삭제 중...' : '🗑️ 전체 글 삭제'}
                    </button>

                    <button 
                        onClick={fetchAllData}
                        disabled={loading || seedingStatus === 'seeding'}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {loading ? '로딩 중...' : '데이터 다시 로드'}
                    </button>
                    
                    <button 
                        onClick={createTestContent}
                        disabled={seedingStatus === 'seeding'}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        단일 테스트 데이터 생성
                    </button>
                </div>

                {/* 완성작 전용 생성 섹션 */}
                <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold mb-3">🎨 완성작 전용 생성</h2>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <button 
                            onClick={createQuickWork}
                            disabled={seedingStatus === 'seeding'}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            ⚡ 빠른 완성작 1개 생성
                        </button>
                        
                        <button 
                            onClick={() => createCompletedWorks(3)}
                            disabled={seedingStatus === 'seeding'}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            🎨 완성작 3개 생성
                        </button>
                        
                        <button 
                            onClick={() => createCompletedWorks(5)}
                            disabled={seedingStatus === 'seeding'}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            🚀 완성작 5개 생성
                        </button>
                        
                        <button 
                            onClick={() => createCompletedWorks(8)}
                            disabled={seedingStatus === 'seeding'}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                        >
                            💯 완성작 8개 생성 (전체)
                        </button>
                    </div>

                    <div className="text-sm text-white-600 bg-red-50 p-3 rounded mb-4">
                        <p><strong>✨ 완성작 생성 내용:</strong></p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>드래곤 헌터, 사이버 탐정, 마법 아카데미 등 다양한 장르</li>
                            <li>각 작품마다 완전한 스토리 내용 포함</li>
                            <li>즉시 갤러리에서 확인 가능한 완성작</li>
                            <li>작업 중인 캔버스는 생성되지 않음</li>
                        </ul>
                    </div>
                </div>

                {/* 기존 Mock 데이터 관리 (작업중 + 완성작 혼합) */}
                <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold mb-3">🌱 전체 Mock 데이터 (작업중 + 완성작)</h2>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <button 
                            onClick={seedMockData}
                            disabled={seedingStatus === 'seeding'}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
                        >
                            {seedingStatus === 'seeding' ? '🌱 전체 데이터 삽입 중...' : '🚀 전체 Mock 데이터 삽입'}
                        </button>
                        
                        <button 
                            onClick={clearTestData}
                            disabled={seedingStatus === 'seeding'}
                            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                            🧹 테스트 데이터 정리
                        </button>
                    </div>

                    <div className="text-sm text-white-600 bg-black-50 p-3 rounded">
                        <p><strong>💡 전체 Mock 데이터 삽입 내용:</strong></p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>완성된 작품 5개 (판타지, SF, 마법학교 등)</li>
                            <li>작업 중인 캔버스 3개</li>
                            <li>각 작품의 기본 글 내용 포함</li>
                            <li>실제 DB에 저장되어 페이지에서 바로 확인 가능</li>
                        </ul>
                    </div>
                </div>

                {/* Seeding 상태 표시 - 모든 생성 작업에 공통 사용 */}
                {seedingStatus !== 'idle' && (
                    <div className={`p-4 rounded-lg mb-4 ${
                        seedingStatus === 'seeding' ? 'bg-yellow-100 border border-yellow-300' :
                        seedingStatus === 'success' ? 'bg-green-100 border border-green-300' :
                        'bg-red-100 border border-red-300'
                    }`}>
                        <div className="flex items-center space-x-2">
                            {seedingStatus === 'seeding' && <div className="animate-spin text-yellow-600">🌀</div>}
                            {seedingStatus === 'success' && <div className="text-green-600">✅</div>}
                            {seedingStatus === 'error' && <div className="text-red-600">❌</div>}
                            
                            <span className={`font-medium ${
                                seedingStatus === 'seeding' ? 'text-yellow-800' :
                                seedingStatus === 'success' ? 'text-green-800' :
                                'text-red-800'
                            }`}>
                                {seedingStatus === 'seeding' && '데이터를 생성하고 있습니다...'}
                                {seedingStatus === 'success' && '데이터 생성이 완료되었습니다!'}
                                {seedingStatus === 'error' && '데이터 생성 중 오류가 발생했습니다.'}
                            </span>
                        </div>
                        
                        {seedResult && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm">결과 상세 보기</summary>
                                <pre className="mt-2 p-2 bg-black rounded text-xs overflow-auto max-h-48">
                                    {JSON.stringify(seedResult, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
                    <h3 className="font-bold text-red-800">오류 발생:</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* 커버 데이터 */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">커버 데이터 ({covers.length}개)</h2>
                <div className="grid gap-4">
                    {covers.map((cover) => (
                        <div key={cover.id} className="p-4 border rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Cover ID:</strong> {cover.id}</div>
                                <div><strong>Content ID:</strong> {cover.contentId || '없음'}</div>
                                <div><strong>제목:</strong> {cover.title}</div>
                                <div><strong>상태:</strong> {cover.roomType}</div>
                                <div><strong>Room ID:</strong> {cover.roomId || '없음'}</div>
                                <div><strong>생성 시간:</strong> {new Date(cover.time).toLocaleString()}</div>
                            </div>
                            {cover.contentId && (
                                <div className="mt-2">
                                    <a 
                                        href={`/completed/${cover.id}`}
                                        className="text-red-500 hover:underline text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        → 완성작 보기 (/completed/{cover.id})
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 컨텐츠 데이터 */}
            <div>
                <h2 className="text-xl font-semibold mb-4">컨텐츠 데이터 ({contents.length}개)</h2>
                <div className="grid gap-4">
                    {contents.map((item) => (
                        <div key={item.coverId} className="p-4 border rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div><strong>Cover ID:</strong> {item.coverId}</div>
                                <div><strong>Content ID:</strong> {item.contentId}</div>
                                <div><strong>제목:</strong> {item.title}</div>
                                <div>
                                    <strong>상태:</strong> 
                                    <span className={item.error ? 'text-red-600' : 'text-green-600'}>
                                        {item.error ? '오류' : '정상'}
                                    </span>
                                </div>
                            </div>
                            {item.error && (
                                <div className="text-red-600 text-sm">
                                    <strong>오류:</strong> {item.error}
                                </div>
                            )}
                            {item.content && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-red-600 text-sm">컨텐츠 상세 정보</summary>
                                    <pre className="mt-2 p-2 bg-black-100 rounded text-xs overflow-auto">
                                        {JSON.stringify(item.content, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}