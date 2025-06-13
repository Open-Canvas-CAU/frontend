// src/App.jsx - 수정된 라우팅 구조

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import CreatePage from '@/pages/CreatePage';
import CompletedCanvasPage from '@/components/features/editor/CompletedCanvasPage';
import CanvasViewPage from '@/components/features/editor/CanvasViewPage'; //  새로 추가
import SearchResultsPage from '@/pages/SearchResultsPage';
import PalettePage from "@/pages/PalettePage.jsx";
import FavoritesPage from "@/pages/FavoritesPage.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute.jsx";
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import MyCanvasPage from '@/pages/MyCanvasPage';
import ProfilePage from '@/pages/ProfilePage';

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        {/* 공개 페이지들 */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/gallery" element={<LandingPage />} />
                        <Route path="/workingon" element={<LandingPage />} />
                        <Route path="/search" element={<SearchResultsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
                        <Route path="/canvas/:coverId" element={<CanvasViewPage />} />
                        <Route path="/completed/:coverId" element={<CompletedCanvasPage />} />
                        <Route path="/content/:contentId" element={<CompletedCanvasPage />} />
                        <Route path="/editor/:roomId" element={<EditorPage />} />

                        {/* 인증이 필요한 페이지들 */}
                        <Route
                            path="/canvas/new"
                            element={
                                <ProtectedRoute>
                                    <CreatePage />
                                </ProtectedRoute>
                            }
                        />
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
                            path="/my-canvas"
                            element={
                                <ProtectedRoute>
                                    <MyCanvasPage />
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
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
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
                    </Route>
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}