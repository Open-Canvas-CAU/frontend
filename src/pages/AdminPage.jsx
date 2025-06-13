import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coverService } from '@/services/coverService';

export default function AdminPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 게시물 목록 로드
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await coverService.getAllCovers();
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                setError('게시물을 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 게시물 삭제
    const handleDelete = async (postId) => {
        try {
            await coverService.deleteCover(postId);
            setPosts(posts.filter(post => post.id !== postId));
            setShowDeleteModal(false);
            setSelectedPost(null);
        } catch (err) {
            setError('게시물 삭제에 실패했습니다.');
        }
    };

    // 검색 필터링
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4">로딩 중...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">게시물 관리</h1>
            
            {/* 검색 */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="제목으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* 게시물 목록 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {post.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {post.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setShowDeleteModal(true);
                                        }}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 삭제 확인 모달 */}
            {showDeleteModal && selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h3 className="text-lg font-bold mb-4">게시물 삭제</h3>
                        <p className="mb-4">정말로 "{selectedPost.title}" 게시물을 삭제하시겠습니까?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPost(null);
                                }}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => handleDelete(selectedPost.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 