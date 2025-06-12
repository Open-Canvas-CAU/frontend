// src/utils/completedDataSeeder.js
import api from '@/services/api'

// 완성된 작품 템플릿 데이터
const completedWorks = [
  {
    title: "드래곤 헌터의 마지막 모험",
    coverImageUrl: "https://picsum.photos/400/300?random=101",
    story: `<h1>에pilogue</h1>
<p>전설의 드래곤 헌터 아리안이 마지막 퀘스트를 떠나는 이야기...</p>
<p>수십 년간 무수한 드래곤들과 맞서 싸워온 그에게 남은 것은 단 하나의 목표뿐이었다.</p>
<h2>1장: 마지막 의뢰</h2>
<p>길드장이 건넨 양피지에는 고대 드래곤 '이그드라실'의 목격담이 적혀있었다.</p>
<p>"이번이 정말 마지막이야..." 아리안은 낡은 검을 만지며 중얼거렸다.</p>`,
    genres: ["판타지", "모험"],
    stats: { views: 1247, likes: 89 }
  },
  {
    title: "네온 도시의 사이버 탐정",
    coverImageUrl: "https://picsum.photos/400/300?random=102",
    story: `<h1>2087년, 뉴토쿄</h1>
<p>비가 내리는 네온사인 가득한 거리에서 사이버 탐정 케이는 새로운 사건을 맡았다.</p>
<p>AI와 인간이 공존하는 세상에서, 완전 범죄란 존재할 수 있을까?</p>
<h2>Chapter 1: 디지털 유령</h2>
<p>클라이언트는 홀로그램으로 나타났다. 그의 딸이 가상현실에서 실종되었다는 것이다.</p>
<p>"현실과 가상의 경계가 무너진 이 시대에, 과연 그녀는 어디에 있는 걸까?"</p>`,
    genres: ["SF", "미스터리"],
    stats: { views: 892, likes: 156 }
  },
  {
    title: "마법 아카데미 졸업시험",
    coverImageUrl: "https://picsum.photos/400/300?random=103",
    story: `<h1>아르카나 마법학교 7학년</h1>
<p>리나는 마법학교 졸업시험을 앞두고 있었다. 그러나 시험 내용이 예상과 전혀 달랐다.</p>
<p>단순한 주문 시전이 아닌, 실제 위험한 던전을 탐험해야 하는 실전 시험이었던 것이다.</p>
<h2>시험 1일차</h2>
<p>"파티를 구성하여 고블린 동굴을 클리어하시오." 시험관의 차가운 목소리가 울려 퍼졌다.</p>
<p>리나는 같은 반 친구들과 눈을 마주치며 긴장된 미소를 지었다.</p>`,
    genres: ["판타지", "학원"],
    stats: { views: 2341, likes: 203 }
  },
  {
    title: "스팀펑크 세계의 발명가",
    coverImageUrl: "https://picsum.photos/400/300?random=104",
    story: `<h1>빅토리아 시대, 또 다른 세계</h1>
<p>증기기관이 극도로 발달한 세계에서 천재 발명가 에드워드는 세상을 바꿀 발명을 꿈꾸고 있었다.</p>
<p>하지만 그의 발명품들은 항상 예상치 못한 부작용을 일으켰다.</p>
<h2>실험실의 폭발</h2>
<p>또 다시 폭발음이 울려 퍼졌다. 연기 속에서 에드워드가 기침을 하며 나타났다.</p>
<p>"이번엔 분명히 성공할 줄 알았는데..." 그의 눈에는 포기할 수 없는 열정이 타오르고 있었다.</p>`,
    genres: ["스팀펑크", "모험"],
    stats: { views: 567, likes: 78 }
  },
  {
    title: "우주 정거장의 비밀",
    coverImageUrl: "https://picsum.photos/400/300?random=105",
    story: `<h1>오리온 우주정거장</h1>
<p>지구에서 50광년 떨어진 우주정거장에서 근무하는 엔지니어 사라는 이상한 신호를 감지했다.</p>
<p>그 신호는 정거장 깊숙한 곳, 아무도 접근하지 않는 구역에서 나오고 있었다.</p>
<h2>금지구역</h2>
<p>경고등이 붉게 깜빡이는 복도를 따라 걸으며, 사라는 점점 더 이상한 기운을 느꼈다.</p>
<p>"여기서 도대체 무슨 일이 일어나고 있는 거지?" 그녀의 손이 문 앞에서 망설여졌다.</p>`,
    genres: ["SF", "스릴러"],
    stats: { views: 1456, likes: 134 }
  },
  {
    title: "시간 여행자의 딜레마",
    coverImageUrl: "https://picsum.photos/400/300?random=106",
    story: `<h1>시간의 균열</h1>
<p>물리학자 제임스는 실수로 시간여행 장치를 발명했다. 하지만 과거를 바꾸는 것이 과연 옳을까?</p>
<p>그는 10년 전, 사랑하는 사람을 잃었던 그 날로 돌아갈 수 있게 되었다.</p>
<h2>선택의 기로</h2>
<p>시간 장치 앞에 선 제임스의 손이 떨렸다. 버튼 하나만 누르면 모든 것이 달라질 수 있었다.</p>
<p>"하지만 그렇게 되면 지금의 나는 존재하지 않게 되는 걸까?" 그는 깊은 고민에 빠졌다.</p>`,
    genres: ["SF", "로맨스"],
    stats: { views: 987, likes: 112 }
  },
  {
    title: "바다 위의 해적 여왕",
    coverImageUrl: "https://picsum.photos/400/300?random=107",
    story: `<h1>카리브해의 전설</h1>
<p>해적선 '블랙 펄'의 선장 엘리자베스는 전설의 보물을 찾아 항해하고 있었다.</p>
<p>하지만 바다에는 그녀보다 더 위험한 적들이 도사리고 있었다.</p>
<h2>폭풍우 속의 결전</h2>
<p>거대한 파도가 배를 덮치는 가운데, 엘리자베스는 키를 놓지 않았다.</p>
<p>"포기하는 건 죽는 것과 같아!" 그녀의 외침이 폭풍우를 뚫고 선원들에게 전해졌다.</p>`,
    genres: ["모험", "액션"],
    stats: { views: 1789, likes: 167 }
  },
  {
    title: "마법의 숲 수호자",
    coverImageUrl: "https://picsum.photos/400/300?random=108",
    story: `<h1>엘프 숲의 수호자</h1>
<p>마지막 엘프족인 아리엘은 마법의 숲을 지키는 수호자 역할을 맡고 있었다.</p>
<p>하지만 인간들의 침입이 점점 더 잦아지고 있었다.</p>
<h2>침입자들</h2>
<p>숲의 가장 깊숙한 곳에서 나무들의 속삭임이 들려왔다. 위험한 기운이 느껴졌다.</p>
<p>"숲의 마법이 약해지고 있어..." 아리엘은 고대의 주문을 준비하기 시작했다.</p>`,
    genres: ["판타지", "자연"],
    stats: { views: 634, likes: 89 }
  }
]

class CompletedDataSeeder {
  constructor() {
    this.createdWorks = []
  }

  /**
   * 완성된 작품들만 생성
   */
  async createCompletedWorks(count = 5) {
    console.log(`🎨 완성된 작품 ${count}개 생성 시작...`)
    
    try {
      const worksToCreate = completedWorks.slice(0, count)
      
      for (let i = 0; i < worksToCreate.length; i++) {
        const work = worksToCreate[i]
        await this.createSingleCompletedWork(work, i + 1, worksToCreate.length)
        
        // API 호출 간격 조절
        await this.delay(500)
      }
      
      console.log(`완성된 작품 생성 완료: ${this.createdWorks.length}개`)
      return this.createdWorks
      
    } catch (error) {
      console.error(' 완성된 작품 생성 실패:', error)
      throw error
    }
  }

  /**
   * 단일 완성 작품 생성
   */
  async createSingleCompletedWork(workData, current, total) {
    console.log(`   Creating work ${current}/${total}: ${workData.title}`)
    
    try {
      // 1. 커버 생성
      const coverData = {
        title: workData.title,
        coverImageUrl: workData.coverImageUrl,
        time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // 랜덤한 과거 시간
        limit: Math.floor(Math.random() * 5) + 3 // 3-7명 랜덤
      }
      
      const coverResponse = await api.post('/api/covers', coverData)
      const cover = coverResponse.data
      console.log(`     Cover created: ID ${cover.id}`)
      
      // 2. 글 작성 (룸 생성)
      const writingDto = {
        title: workData.title,
        body: workData.story,
        depth: 0,
        siblingIndex: 0,
        time: new Date().toISOString()
      }
      
      const roomResponse = await api.post('/api/rooms/create', writingDto)
      console.log(`     Room created: ${roomResponse.data.roomId}`)
      
      // 3. 컨텐츠 생성/조회 (이것이 완성작으로 만드는 핵심)
      const contentResponse = await api.get(`/api/contents/${cover.id}`)
      const content = contentResponse.data
      console.log(`     Content created: ID ${content.id}`)
      
      // 4. 추가 상호작용 시뮬레이션 (조회수, 좋아요 등)
      if (workData.stats) {
        await this.simulateInteractions(content.id, workData.stats)
      }
      
      this.createdWorks.push({
        coverId: cover.id,
        contentId: content.id,
        title: workData.title,
        genres: workData.genres,
        roomId: roomResponse.data.roomId
      })
      
    } catch (error) {
      console.error(`     Failed to create work: ${workData.title}`, error.message)
      throw error
    }
  }

  /**
   * 사용자 상호작용 시뮬레이션 (조회수, 좋아요 등)
   */
  async simulateInteractions(contentId, stats) {
    try {
      // 조회수 시뮬레이션 (여러 번 content 조회)
      const viewCount = Math.min(stats.views || 0, 10) // 최대 10번 API 호출
      for (let i = 0; i < viewCount; i++) {
        try {
          await api.get(`/api/contents/${contentId}`)
          await this.delay(50) // 짧은 간격
        } catch (error) {
          // 조회 실패는 무시
        }
      }
      
      // 좋아요 시뮬레이션 (제한적으로)
      const likeCount = Math.min(stats.likes || 0, 3) // 최대 3번만
      for (let i = 0; i < likeCount; i++) {
        try {
          await api.post('/api/contents/like-toggle', null, {
            params: { contentId, likeType: 'LIKE' }
          })
          await this.delay(100)
        } catch (error) {
          // 좋아요 실패는 무시 (인증 필요할 수 있음)
          break
        }
      }
      
    } catch (error) {
      console.warn('     상호작용 시뮬레이션 실패 (무시됨):', error.message)
    }
  }

  /**
   * 빠른 단일 작품 생성 (테스트용)
   */
  async createQuickWork() {
    const randomWork = completedWorks[Math.floor(Math.random() * completedWorks.length)]
    const timestamp = Date.now()
    
    const workData = {
      ...randomWork,
      title: `${randomWork.title} (${timestamp})`,
      coverImageUrl: `https://picsum.photos/400/300?random=${timestamp}`
    }
    
    await this.createSingleCompletedWork(workData, 1, 1)
    return this.createdWorks[this.createdWorks.length - 1]
  }

  /**
   * 지연 함수
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 생성 결과 요약
   */
  getSummary() {
    return {
      totalWorks: this.createdWorks.length,
      works: this.createdWorks.map(work => ({
        title: work.title,
        coverId: work.coverId,
        contentId: work.contentId,
        genres: work.genres,
        url: `/completed/${work.coverId}`
      }))
    }
  }

  /**
   * 초기화
   */
  reset() {
    this.createdWorks = []
  }
}

// 싱글톤 인스턴스
const completedDataSeeder = new CompletedDataSeeder()

export default completedDataSeeder