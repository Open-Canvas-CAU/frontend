// src/components/ServerHealthChecker.jsx - 개선된 서버 상태 확인 컴포넌트
import React, { useState, useEffect } from 'react'
import { ServerChecker } from '@/utils/serverChecker'

export default function ServerHealthChecker({ onStatusChange = null }) {
    const [serverStatus, setServerStatus] = useState('checking')
    const [lastChecked, setLastChecked] = useState(null)
    const [connectionResults, setConnectionResults] = useState(null)
    const [diagnosis, setDiagnosis] = useState(null)

    //  개선된 서버 상태 확인
    const checkServerHealth = async () => {
        try {
            setServerStatus('checking')
            setConnectionResults(null)
            setDiagnosis(null)
            
            console.log('Starting comprehensive server check...')
            const results = await ServerChecker.checkConnection()
            const diagnosisResult = ServerChecker.diagnoseIssue(results)
            
            setConnectionResults(results)
            setDiagnosis(diagnosisResult)
            setLastChecked(new Date())
            
            if (results.isConnected) {
                setServerStatus('connected')
                onStatusChange?.('connected')
                console.log('Server connection successful')
            } else {
                setServerStatus('disconnected')
                onStatusChange?.('disconnected')
                console.log(' Server connection failed:', results)
            }
            
        } catch (error) {
            console.error(' Server health check failed:', error)
            setServerStatus('error')
            setLastChecked(new Date())
            onStatusChange?.('error')
        }
    }

    // 컴포넌트 마운트 시 자동 체크
    useEffect(() => {
        checkServerHealth()
    }, [])

    // 주기적 체크 (30초마다, 연결 실패한 경우에만)
    useEffect(() => {
        const interval = setInterval(() => {
            if (serverStatus === 'disconnected' || serverStatus === 'error') {
                checkServerHealth()
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [serverStatus])

    const getStatusIcon = () => {
        switch (serverStatus) {
            case 'connected': 
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>;
            case 'disconnected': 
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>;
            case 'checking': 
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>;
            case 'error': 
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>;
            default: 
                return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>;
        }
    }

    const getStatusColor = () => {
        switch (serverStatus) {
            case 'connected': return 'text-red-600'
            case 'disconnected': return 'text-red-600'
            case 'checking': return 'text-red-600'
            case 'error': return 'text-orange-600'
            default: return 'text-white-600'
        }
    }

    const getStatusText = () => {
        switch (serverStatus) {
            case 'connected': return `서버 연결됨 (${connectionResults?.workingEndpoint})`
            case 'disconnected': return '서버 연결 실패'
            case 'checking': return '서버 확인 중...'
            case 'error': return '연결 검사 오류'
            default: return '알 수 없음'
        }
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'border-red-500 bg-red-50'
            case 'high': return 'border-orange-500 bg-orange-50'
            case 'medium': return 'border-red-500 bg-red-50'
            default: return 'border-red-500 bg-red-50'
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-black border border-white/10 rounded-xl shadow-lg p-4 max-w-sm">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">서버 상태</span>
                        <span className={`text-sm ${getStatusColor(serverStatus)}`}>
                            {getStatusText(serverStatus)}
                        </span>
                    </div>
                    
                    {serverStatus === 'connected' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                            <div className="text-red-700 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>서버가 정상적으로 연결되었습니다! 모든 기능을 사용할 수 있습니다.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}