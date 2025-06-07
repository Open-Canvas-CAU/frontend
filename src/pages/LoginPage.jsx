import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // 로그인 후 리다이렉트할 경로 (없으면 홈으로)
    const from = location.state?.from?.pathname || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await authService.login(email, password)
            const { accessToken, refreshToken, user } = response.data

            // 토큰과 사용자 정보 저장
            authService.saveTokens(accessToken, refreshToken, user)

            // 이전 페이지로 리다이렉트
            navigate(from, { replace: true })
        } catch (err) {
            console.error('로그인 실패:', err)
            setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-solarized-base2 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        로그인
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                이메일
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                loading
                                    ? 'bg-yellow-300 cursor-not-allowed'
                                    : 'bg-yellow-300 hover:bg-yellow-300/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300'
                            }`}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <p className="text-gray-600">
                            테스트 계정: test@example.com / password
                        </p>
                        <p className="text-gray-600">
                            관리자 계정: admin@example.com / password
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
