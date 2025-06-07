import { http, HttpResponse } from 'msw'

const mockCovers = [
  {
    title: "첫 번째 캔버스 - 해피데이",
    coverImageUrl: "https://picsum.photos/400/300?random=1",
    contentId: 1,
    time: new Date().toISOString(),
    view: 100,
    likeNum: 50
  },
  {
    contentId: 2,
    title: "두 번째 캔버스 - 슬픈날",
    coverImageUrl: "https://picsum.photos/400/300?random=2",
    time: new Date().toISOString(),
    view: 80,
    likeNum: 30
  },
  {
    contentId: 3,
    title: "세 번째 캔버스 - 행복한 시간",
    coverImageUrl: "https://picsum.photos/400/300?random=3",
    time: new Date().toISOString(),
    view: 60,
    likeNum: 20
  },
  {
    contentId: 4,
    title: "네 번째 캔버스 - 힘든 순간",
    coverImageUrl: "https://picsum.photos/400/300?random=4",
    time: new Date().toISOString(),
    view: 90,
    likeNum: 40
  },
  {
    contentId: 5,
    title: "다섯 번째 캔버스 - 즐거운 하루",
    coverImageUrl: "https://picsum.photos/400/300?random=5",
    time: new Date().toISOString(),
    view: 70,
    likeNum: 25
  }
]

// Mock 유저 데이터 (UserDto 기반)
const mockUsers = [
  {
    id: 1,
    email: "test@example.com",
    nickname: "test@example.com",
    color: "#FF5733",
    role: "USER",
    likeDtos: [],
    writingDtos: []
  },
  {
    id: 2,
    email: "admin@example.com",
    nickname: "admin@example.com",
    color: "#33FF57",
    role: "ADMIN",
    likeDtos: [],
    writingDtos: []
  }
]

// Mock 토큰 데이터
const mockTokens = {
  "test@example.com": {
    accessToken: "mock-access-token-1",
    refreshToken: "mock-refresh-token-1"
  },
  "admin@example.com": {
    accessToken: "mock-access-token-2",
    refreshToken: "mock-refresh-token-2"
  }
}

// Mock 컨텐츠 데이터 (ContentDto 기반)
const mockContents = {
  1: {
    id: 1,
    view: 100,
    commentDtos: [
      {
        id: 1,
        contentDto: null, // 순환 참조 방지
        userDto: {
          id: 2,
          nickname: "user2@example.com",
          email: "user2@example.com",
          color: "#33FF57",
          role: "USER",
          likeDtos: [],
          writingDtos: []
        },
        commentLikeDtos: [],
        body: "멋진 작품이네요!",
        time: "2024-03-20T12:30:00Z"
      }
    ],
    writingDtos: [
      {
        depth: 0,
        siblingIndex: 0,
        parentSiblingIndex: null,
        body: "이 작품은...",
        time: "2024-03-20T12:00:00Z",
        username: "test@example.com",
        title: "첫 번째 캔버스 - 해피데이",
        userId: 1,
        contentId: 1,
        color: "#FF5733"
      },
      {
        depth: 1,
        siblingIndex: 0,
        parentSiblingIndex: 0,
        body: "이어쓰기 첫 번째...",
        time: "2024-03-20T12:15:00Z",
        username: "user2@example.com",
        title: "첫 번째 캔버스 - 해피데이",
        userId: 2,
        contentId: 1,
        color: "#33FF57"
      }
    ],
    likeDtos: [
      {
        contentTitle: "첫 번째 캔버스 - 해피데이",
        email: "user2@example.com",
        likeType: "LIKE"
      }
    ],
    coverDto: mockCovers[0],
    likeNum: 50,
    likeType: null, // 현재 사용자의 좋아요 상태
    title: "첫 번째 캔버스 - 해피데이"
  }
}

// 추천 작품 목록 (ContentDto 배열)
const mockRecommendations = [
  {
    id: 2,
    view: 80,
    commentDtos: [],
    writingDtos: [
      {
        depth: 0,
        siblingIndex: 0,
        parentSiblingIndex: null,
        body: "두 번째 작품입니다...",
        time: "2024-03-20T13:00:00Z",
        username: "user2@example.com",
        title: "두 번째 캔버스 - 슬픈날",
        userId: 2,
        contentId: 2,
        color: "#33FF57"
      }
    ],
    likeDtos: [],
    coverDto: mockCovers[1],
    likeNum: 30,
    likeType: null,
    title: "두 번째 캔버스 - 슬픈날"
  }
]

// 작업 중인 캔버스 목록
const mockWorkingOnCovers = [
  {
    title: "작업 중인 캔버스 1",
    coverImageUrl: "https://picsum.photos/400/300?random=6",
    contentId: 6,
    time: new Date().toISOString(),
    view: 0,
    likeNum: 0
  },
  {
    title: "작업 중인 캔버스 2",
    coverImageUrl: "https://picsum.photos/400/300?random=7",
    contentId: 7,
    time: new Date().toISOString(),
    view: 0,
    likeNum: 0
  }
]

export const handlers = [
  // 인증 관련 API
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json()
    console.log('Mock API: POST /api/auth/login called with:', { email, password })

    const user = mockUsers.find(u => u.email === email)
    if (!user || password !== 'password') {
      return new HttpResponse(null, { status: 401 })
    }

    const tokens = mockTokens[email]
    return HttpResponse.json({
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        color: user.color,
        role: user.role
      }
    })
  }),

  http.post('/auth/refresh', async ({ request }) => {
    const { refreshToken } = await request.json()
    console.log('Mock API: POST /auth/refresh called with refreshToken')

    const userEmail = Object.entries(mockTokens).find(([_, tokens]) => 
      tokens.refreshToken === refreshToken
    )?.[0]

    if (!userEmail) {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json({
      accessToken: mockTokens[userEmail].accessToken
    })
  }),

  // 커버 관련 API
  http.get('/api/covers/all', () => {
    console.log('Mock API: GET /api/covers/all called')
    return HttpResponse.json(mockCovers)
  }),

  http.get('/api/covers/likes', () => {
    console.log('Mock API: GET /api/covers/likes called')
    return HttpResponse.json([...mockCovers].sort((a, b) => b.likeNum - a.likeNum))
  }),

  http.get('/api/covers/views', () => {
    console.log('Mock API: GET /api/covers/views called')
    return HttpResponse.json([...mockCovers].sort((a, b) => b.view - a.view))
  }),

  http.get('/api/covers/search', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('arg0')
    console.log('Mock API: GET /api/covers/search called with keyword:', keyword)
    
    if (!keyword) {
      return HttpResponse.json(mockCovers)
    }

    const filteredCovers = mockCovers.filter(cover => 
      cover.title.toLowerCase().includes(keyword.toLowerCase())
    )
    return HttpResponse.json(filteredCovers)
  }),

  // 작업 중인 캔버스 API
  http.get('/api/covers/working-on', () => {
    console.log('Mock API: GET /api/covers/working-on called')
    return HttpResponse.json(mockWorkingOnCovers)
  }),

  // 컨텐츠 관련 API
  http.get('/api/contents/:coverId', ({ params }) => {
    const contentId = parseInt(params.coverId)
    console.log('Mock API: GET /api/contents/:coverId called with:', contentId)
    
    const content = mockContents[contentId]
    if (!content) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(content)
  }),

  http.post('/api/contents/like-toggle', async ({ request }) => {
    const url = new URL(request.url)
    const contentId = parseInt(url.searchParams.get('contentId'))
    const likeType = url.searchParams.get('likeType')
    console.log('Mock API: POST /api/contents/like-toggle called with:', { contentId, likeType })

    const content = mockContents[contentId]
    if (!content) {
      return new HttpResponse(null, { status: 404 })
    }

    // 좋아요 토글 로직
    if (content.likeType === likeType) {
      content.likeType = null
      content.likeNum -= 1
    } else {
      content.likeType = likeType
      content.likeNum += content.likeType === "LIKE" ? 1 : -1
    }

    return HttpResponse.json(content)
  }),

  // 댓글 관련 API
  http.get('/api/comments/by-content', ({ request }) => {
    const url = new URL(request.url)
    const contentId = parseInt(url.searchParams.get('contentId'))
    console.log('Mock API: GET /api/comments/by-content called with:', contentId)
    
    const content = mockContents[contentId]
    if (!content) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(content.commentDtos)
  }),

  http.post('/api/comments/write', async ({ request }) => {
    const { contentId, body } = await request.json()
    console.log('Mock API: POST /api/comments/write called with:', { contentId, body })
    
    const content = mockContents[contentId]
    if (!content) {
      return new HttpResponse(null, { status: 404 })
    }
    
    const newComment = {
      id: Date.now(),
      contentDto: null,
      userDto: {
        id: 1,
        nickname: "test@example.com",
        email: "test@example.com",
        color: "#FF5733",
        role: "USER",
        likeDtos: [],
        writingDtos: []
      },
      commentLikeDtos: [],
      body,
      time: new Date().toISOString()
    }
    
    content.commentDtos.push(newComment)
    return HttpResponse.json(newComment)
  }),

  http.delete('/api/comments/delete', ({ request }) => {
    const url = new URL(request.url)
    const contentId = parseInt(url.searchParams.get('contentId'))
    const commentId = parseInt(url.searchParams.get('commentId'))
    console.log('Mock API: DELETE /api/comments/delete called with:', { contentId, commentId })
    
    const content = mockContents[contentId]
    if (!content) {
      return new HttpResponse(null, { status: 404 })
    }
    
    content.commentDtos = content.commentDtos.filter(
      comment => comment.id !== commentId
    )
    return new HttpResponse(null, { status: 204 })
  }),

  // 유저 관련 API
  http.get('/api/users/', () => {
    console.log('Mock API: GET /api/users/ called')
    return HttpResponse.json(mockUsers[0]) // 현재 로그인한 유저 정보 반환
  }),

  http.put('/api/users/color', ({ request }) => {
    const url = new URL(request.url)
    const color = url.searchParams.get('color')
    console.log('Mock API: PUT /api/users/color called with:', color)
    
    mockUsers[0].color = color
    return HttpResponse.json(color)
  }),

  http.get('/api/users/likes', () => {
    console.log('Mock API: GET /api/users/likes called')
    return HttpResponse.json(Object.values(mockContents)) // 좋아요한 컨텐츠 목록 반환
  }),

  // 추천 작품 API (추가)
  http.get('/api/contents/:contentId/recommendations', ({ params }) => {
    const contentId = parseInt(params.contentId)
    console.log('Mock API: GET /api/contents/:contentId/recommendations called with:', contentId)
    return HttpResponse.json(mockRecommendations)
  })
] 