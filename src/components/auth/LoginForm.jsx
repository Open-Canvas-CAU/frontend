import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = e => {
        e.preventDefault()
        // TODO: 실제 로그인 API 호출 → 성공 시 아래 navigate
        navigate(-1) // 로그인 전 페이지로 돌아가기
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg p-8  rounded-xl space-y-6"
        >
            <h1 className="text-stone-700 text-4xl font-bold text-center">Sign in</h1>

            <div>
                <label className="block mb-1 text-stone-800 text-xl font-semibold">
                    아이디 또는 이메일
                </label>
                <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="아이디를 입력해주세요"
                    className="w-full px-4 py-3 bg-zinc-200 rounded-lg text-stone-700 placeholder-zinc-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block mb-1 text-stone-800 text-xl font-semibold">
                    비밀번호
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요"
                    className="w-full px-4 py-3 bg-zinc-200 rounded-lg text-stone-700 placeholder-zinc-500 focus:outline-none"
                />
            </div>

            <div className="flex justify-end">
                <button type="button" className="text-stone-700 text-xl">
                    아이디 / 비밀번호 찾기
                </button>
            </div>

            <button
                type="submit"
                className="w-full py-4 rounded-full border border-sky-300 text-stone-700 text-3xl font-semibold hover:bg-sky-600"
            >
                로그인
            </button>

            <div className="text-center text-stone-700 text-xl">
                계정이 없으신가요?{' '}
                <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-blue-800 font-semibold"
                >
                    회원가입
                </button>
            </div>
        </form>
    )
}
