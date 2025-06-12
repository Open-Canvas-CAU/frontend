// src/App.jsx 수정된 부분

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import CreatePage from '@/pages/CreatePage';
import CompletedCanvasPage from '@/components/features/editor/CompletedCanvasPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import PalettePage from "@/pages/PalettePage.jsx";
import FavoritesPage from "@/pages/FavoritesPage.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute.jsx";
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import DBDataViewer from '@/components/debug/DBDataViewer'; // 디버그 컴포넌트 추가

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/gallery" element={<LandingPage />} />
                        <Route path="/workingon" element={<LandingPage />} />
                        <Route path="/search" element={<SearchResultsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* OAuth2 콜백 라우트 */}
                        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

                        {/* 디버그 라우트 - 개발 중에만 사용 */}
                        <Route path="/debug" element={<DBDataViewer />} />

                        {/* 완성된 작품 보기 - coverId 사용으로 변경 */}
                        <Route path="/completed/:coverId" element={<CompletedCanvasPage />} />
                        
                        {/* 기존 contentId를 사용하는 라우트는 coverId로 리다이렉트 */}
                        <Route path="/content/:contentId" element={<CompletedCanvasPage />} />
                        
                        {/* 에디터 라우팅 - 파라미터명을 roomId로 통일 */}
                        <Route path="/editor/:roomId" element={<EditorPage />} />
                        <Route
                            path="/editor/new"
                            element={
                                <ProtectedRoute>
                                    <CreatePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/editor/:roomId/edit"
                            element={
                                <ProtectedRoute>
                                    <EditorPage isEditing={true} />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/palette"
                            element={
                                <ProtectedRoute>
                                    <PalettePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/favorites"
                            element={
                                <ProtectedRoute>
                                    <FavoritesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mypage"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}