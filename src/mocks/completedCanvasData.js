export const mockCompletedCanvases = [
    {
        id: 1,
        title: "환상의 숲에서 만난 요정 이야기",
        coverImageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
        contentId: 101, // 완성된 작품은 contentId가 있음
        time: "2024-12-15T10:30:00Z",
        view: 1254,
        likeNum: 89,
        roomType: "COMPLETE",
        roomId: null,
        limit: 5
    },
    {
        id: 2,
        title: "미래 도시의 하루",
        coverImageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300&fit=crop",
        contentId: 102,
        time: "2024-12-14T15:45:00Z",
        view: 2103,
        likeNum: 156,
        roomType: "COMPLETE",
        roomId: null,
        limit: 3
    },
    {
        id: 3,
        title: "바다 건너편의 전설",
        coverImageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        contentId: 103,
        time: "2024-12-13T09:15:00Z",
        view: 892,
        likeNum: 67,
        roomType: "COMPLETE",
        roomId: null,
        limit: 4
    },
    {
        id: 4,
        title: "로봇과 인간의 우정",
        coverImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
        contentId: 104,
        time: "2024-12-12T14:20:00Z",
        view: 1876,
        likeNum: 134,
        roomType: "COMPLETE",
        roomId: null,
        limit: 6
    },
    {
        id: 5,
        title: "시간 여행자의 일기",
        coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        contentId: 105,
        time: "2024-12-11T11:30:00Z",
        view: 1432,
        likeNum: 98,
        roomType: "COMPLETE",
        roomId: null,
        limit: 5
    },
    {
        id: 6,
        title: "마법사의 마지막 주문",
        coverImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        contentId: 106,
        time: "2024-12-10T16:45:00Z",
        view: 2341,
        likeNum: 187,
        roomType: "COMPLETE",
        roomId: null,
        limit: 7
    }
]

export const mockWorkingCanvases = [
    {
        id: 7,
        title: "새로운 모험의 시작",
        coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        contentId: null, // 작업 중인 캔버스는 contentId가 null
        time: "2024-12-15T08:30:00Z",
        view: 45,
        likeNum: 8,
        roomType: "EDITING",
        roomId: "room-123-abc", // 작업 중인 캔버스는 roomId가 있음
        limit: 4
    },
    {
        id: 8,
        title: "우주 정거장에서의 일주일",
        coverImageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop",
        contentId: null,
        time: "2024-12-15T07:15:00Z", 
        view: 23,
        likeNum: 5,
        roomType: "AVAILABLE",
        roomId: null, // AVAILABLE 상태는 roomId가 없을 수 있음
        limit: 3
    },
    {
        id: 9,
        title: "고대 유적의 비밀",
        coverImageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c2e?w=400&h=300&fit=crop",
        contentId: null,
        time: "2024-12-14T19:45:00Z",
        view: 67,
        likeNum: 12,
        roomType: "EDITING",
        roomId: "room-456-def",
        limit: 5
    }
]

// 완성된 작품의 상세 데이터
export const mockCompletedContent = {
    101: {
        id: 101,
        view: 1254,
        title: "환상의 숲에서 만난 요정 이야기",
        likeNum: 89,
        likeType: null, // 현재 사용자가 좋아요/싫어요를 누르지 않은 상태
        official: "1.1.0", // 공식 버전
        genres: ["판타지", "모험"],
        coverDto: {
            id: 1,
            title: "환상의 숲에서 만난 요정 이야기",
            coverImageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
            time: "2024-12-15T10:30:00Z"
        },
        writingDtos: [
            {
                depth: 0,
                siblingIndex: 0,
                parentSiblingIndex: 0,
                body: `<h1>환상의 숲에서 만난 요정 이야기</h1>
                       <p>깊은 숲 속에서 작은 요정을 만났다. 그 요정은 반짝이는 날개를 가지고 있었고, 목소리는 바람 소리처럼 부드러웠다.</p>
                       <p>"인간이여, 이곳에 왜 왔나요?" 요정이 물었다. 나는 길을 잃었다고 말했지만, 실제로는 모험을 찾아 헤매고 있었다.</p>
                       <p>요정은 나를 신비로운 나무 아래로 이끌었다. 그 나무는 온통 빛나는 열매들로 가득했다. "이 열매를 먹으면 진실한 마음을 가질 수 있어요."</p>`,
                time: "2024-12-15T10:30:00Z",
                username: "fantasy_writer@gmail.com",
                title: "환상의 숲에서 만난 요정 이야기",
                userId: 1,
                contentId: 101,
                color: "#4F46E5"
            },
            {
                depth: 1,
                siblingIndex: 0,
                parentSiblingIndex: 0,
                body: `<p>나는 조심스럽게 열매를 따서 입에 넣었다. 순간, 세상이 다르게 보이기 시작했다. 요정의 진짜 모습이 보였고, 숲의 모든 생명체들이 나와 대화하기 시작했다.</p>
                       <p>"이제 당신은 우리의 세계를 볼 수 있어요." 요정이 미소지었다. "하지만 이 능력에는 책임이 따라요. 자연을 보호하고, 균형을 지켜야 합니다."</p>`,
                time: "2024-12-15T11:15:00Z",
                username: "nature_lover@gmail.com",
                title: "환상의 숲에서 만난 요정 이야기",
                userId: 2,
                contentId: 101,
                color: "#059669"
            }
        ],
        likeDtos: [
            {
                contentTitle: "환상의 숲에서 만난 요정 이야기",
                email: "reader1@gmail.com",
                likeType: "LIKE"
            },
            {
                contentTitle: "환상의 숲에서 만난 요정 이야기", 
                email: "reader2@gmail.com",
                likeType: "LIKE"
            }
        ],
        commentDtos: [
            {
                id: 1,
                contentId: 101,
                userId: 10,
                body: "정말 아름다운 이야기네요! 요정의 세계가 생생하게 그려집니다.",
                time: "2024-12-15T12:30:00Z",
                likeNum: 5,
                disLikeNum: 0,
                likeType: null,
                commentLikeDtos: []
            },
            {
                id: 2,
                contentId: 101,
                userId: 11,
                body: "판타지 소설의 완벽한 시작이에요. 다음 이야기가 궁금합니다.",
                time: "2024-12-15T13:45:00Z",
                likeNum: 3,
                disLikeNum: 0,
                likeType: null,
                commentLikeDtos: []
            }
        ]
    },
    102: {
        id: 102,
        view: 2103,
        title: "미래 도시의 하루",
        likeNum: 156,
        likeType: null,
        official: "1.2.0",
        genres: ["SF", "미래"],
        coverDto: {
            id: 2,
            title: "미래 도시의 하루",
            coverImageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300&fit=crop",
            time: "2024-12-14T15:45:00Z"
        },
        writingDtos: [
            {
                depth: 0,
                siblingIndex: 0,
                parentSiblingIndex: 0,
                body: `<h1>미래 도시의 하루</h1>
                       <p>2157년, 네오 도쿄의 하늘은 항상 홀로그램 광고들로 가득하다. 나는 126층 아파트에서 눈을 뜨며 하루를 시작한다.</p>
                       <p>AI 비서 아리아가 부드러운 목소리로 오늘의 일정을 알려준다. "좋은 아침이에요, 김사라님. 오늘 날씨는 맑음, 공기질은 보통입니다. 9시에 홀로 회의가 예정되어 있어요."</p>`,
                time: "2024-12-14T15:45:00Z",
                username: "sci_fi_writer@gmail.com",
                title: "미래 도시의 하루",
                userId: 3,
                contentId: 102,
                color: "#7C3AED"
            }
        ],
        likeDtos: [],
        commentDtos: []
    }
    // 다른 컨텐츠들도 필요시 추가...
}