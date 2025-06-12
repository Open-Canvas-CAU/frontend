import { API_BASE_URL } from '@/config'

export class ServerChecker {
    static async checkConnection() {
        const SERVER_URLS = [
            API_BASE_URL,
            `${API_BASE_URL}/api/health`,
            `${API_BASE_URL}/actuator/health`,
            `${API_BASE_URL}/api/test`
        ]

        const results = {
            isConnected: false,
            workingEndpoint: null,
            errors: [],
            corsIssue: false,
            serverRunning: false
        }

        for (const endpoint of SERVER_URLS) {
            try {
                console.log(`Testing endpoint: ${endpoint}`)
                
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000)

                const response = await fetch(endpoint, {
                    method: 'GET',
                    mode: 'cors', // CORS 모드 명시
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                })

                clearTimeout(timeoutId)

                if (response.ok) {
                    results.isConnected = true
                    results.workingEndpoint = endpoint
                    results.serverRunning = true
                    console.log(`Server connected via: ${endpoint}`)
                    break
                } else {
                    results.errors.push({
                        endpoint,
                        status: response.status,
                        statusText: response.statusText,
                        type: 'http_error'
                    })
                    results.serverRunning = true // 서버는 실행 중이지만 엔드포인트 문제
                }

            } catch (error) {
                console.error(` Failed to connect to ${endpoint}:`, error)
                
                let errorType = 'unknown'
                let errorMessage = error.message

                if (error.name === 'AbortError') {
                    errorType = 'timeout'
                    errorMessage = '연결 시간 초과'
                } else if (error.message.includes('CORS')) {
                    errorType = 'cors'
                    errorMessage = 'CORS 정책 위반'
                    results.corsIssue = true
                } else if (error.message.includes('Failed to fetch')) {
                    errorType = 'network'
                    errorMessage = '네트워크 연결 실패 (서버 미실행 또는 CORS 문제)'
                } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
                    errorType = 'connection_refused'
                    errorMessage = '서버 연결 거부 (서버 미실행)'
                }

                results.errors.push({
                    endpoint,
                    error: errorMessage,
                    type: errorType,
                    details: error
                })
            }
        }

        return results
    }

    // 백엔드 서버 상태 진단
    static diagnoseIssue(results) {
        const diagnosis = {
            primaryIssue: '',
            solutions: [],
            severity: 'low'
        }

        if (!results.isConnected) {
            if (results.corsIssue) {
                diagnosis.primaryIssue = 'CORS 정책 문제'
                diagnosis.solutions = [
                    '백엔드 서버의 CORS 설정을 확인하세요',
                    'http://localhost:3000 또는 http://localhost:5173을 허용 목록에 추가',
                    '@CrossOrigin 어노테이션이 컨트롤러에 있는지 확인',
                    'WebMvcConfigurer에서 CORS 전역 설정 확인'
                ]
                diagnosis.severity = 'high'
            } else if (results.errors.some(e => e.type === 'connection_refused')) {
                diagnosis.primaryIssue = '서버가 실행되지 않음'
                diagnosis.solutions = [
                    '백엔드 서버를 http://localhost:8080에서 실행하세요',
                    'application.properties에서 server.port=8080 확인',
                    '다른 프로세스가 8080 포트를 사용하고 있지 않은지 확인'
                ]
                diagnosis.severity = 'critical'
            } else if (results.serverRunning) {
                diagnosis.primaryIssue = '서버는 실행 중이지만 API 엔드포인트 문제'
                diagnosis.solutions = [
                    '루트 경로(/) 컨트롤러가 있는지 확인',
                    'Spring Boot 기본 설정 확인',
                    '서버 로그에서 에러 메시지 확인'
                ]
                diagnosis.severity = 'medium'
            } else {
                diagnosis.primaryIssue = '네트워크 연결 문제'
                diagnosis.solutions = [
                    '인터넷 연결 상태 확인',
                    '방화벽 설정 확인',
                    'localhost 해석 확인 (hosts 파일)'
                ]
                diagnosis.severity = 'medium'
            }
        }

        return diagnosis
    }
}