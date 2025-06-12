// src/components/CorsSetupGuide.jsx - CORS 설정 가이드
import React, { useState } from 'react'

export default function CorsSetupGuide({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('controller')

    if (!isOpen) return null

    const springBootConfigs = [
        {
            id: 'controller',
            title: '1. 컨트롤러별 설정',
            description: '각 컨트롤러에 @CrossOrigin 어노테이션 추가',
            code: `@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class YourController {
    // 컨트롤러 메서드들...
}`
        },
        {
            id: 'global',
            title: '2. 전역 설정 (추천)',
            description: 'WebMvcConfigurer를 구현하여 전역 CORS 설정',
            code: `@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}`
        },
        {
            id: 'properties',
            title: '3. application.properties 설정',
            description: 'application.properties 파일에 CORS 설정 추가',
            code: `# CORS 설정
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# 서버 포트 확인
server.port=8080`
        },
        {
            id: 'security',
            title: '4. Spring Security 설정',
            description: 'Spring Security 사용 시 추가 CORS 설정',
            code: `@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("*"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}`
        }
    ]

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('코드가 클립보드에 복사되었습니다!')
        }).catch(err => {
            console.error('복사 실패:', err)
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">🔧 CORS 설정 가이드</h2>
                            <p className="opacity-90">백엔드 서버에서 CORS를 설정하여 프론트엔드 연결을 허용하세요</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {springBootConfigs.map((config) => (
                            <button
                                key={config.id}
                                onClick={() => setActiveTab(config.id)}
                                className={`px-6 py-4 whitespace-nowrap font-medium transition-colors border-b-2 ${
                                    activeTab === config.id
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                {config.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6 overflow-y-auto max-h-96">
                    {springBootConfigs.map((config) => (
                        <div
                            key={config.id}
                            className={`${activeTab === config.id ? 'block' : 'hidden'}`}
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {config.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{config.description}</p>
                            </div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Java/Spring Boot 코드:
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(config.code)}
                                        className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                    >
                                        📋 복사
                                    </button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{config.code}</code>
                                </pre>
                            </div>

                            {/* 추가 안내 */}
                            {config.id === 'global' && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h4 className="font-semibold text-green-800 mb-2">✅ 추천 설정</h4>
                                    <p className="text-sm text-green-700">
                                        전역 설정은 모든 컨트롤러에 적용되므로 가장 편리합니다. 
                                        src/main/java/config 폴더에 WebConfig.java 파일을 생성하고 위 코드를 추가하세요.
                                    </p>
                                </div>
                            )}

                            {config.id === 'properties' && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">📝 파일 위치</h4>
                                    <p className="text-sm text-blue-700">
                                        application.properties 파일은 src/main/resources/ 폴더에 있습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 푸터 */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">🔄 설정 후 확인사항</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>1. Spring Boot 서버를 재시작하세요</li>
                                <li>2. 브라우저에서 F12 개발자 도구의 Network 탭을 확인하세요</li>
                                <li>3. CORS 관련 에러가 사라졌는지 확인하세요</li>
                                <li>4. 여전히 문제가 있다면 서버 로그를 확인하세요</li>
                            </ul>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                💡 더 자세한 정보는 <a href="https://spring.io/guides/gs/rest-service-cors/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Spring CORS 가이드</a>를 참고하세요
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}