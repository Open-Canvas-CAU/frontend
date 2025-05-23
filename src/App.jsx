// src/App.jsx
import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import EditorPage from './pages/EditorPage'
import CreatePage from './pages/CreatePage'
import CompletedCanvasPage from './components/editor/CompletedCanvasPage'
import SearchResultsPage from './pages/SearchResultsPage'
import PalettePage from "./pages/PalettePage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/gallery" element={<LandingPage/>}/>
                    <Route path="/workingon" element={<LandingPage/>}/>
                    <Route path="/editor/new" element={<CreatePage/>}/>
                    <Route path="/editor/:docId" element={<EditorPage/>}/>
                    <Route path="/completed/:docId" element={<CompletedCanvasPage/>}/>
                    <Route path="/search" element={<SearchResultsPage/>}/>
                    <Route path="/login"      element={<LoginPage />} />
                    <Route
                        path="/palette"
                        element={
                            <ProtectedRoute>
                                <PalettePage/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ProtectedRoute>
                                <FavoritesPage/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mypage"
                        element={
                            <ProtectedRoute>
                                <DashboardPage/>
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
