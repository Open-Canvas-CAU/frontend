// src/utils/mockDataSeeder.js
import api from '@/services/api'

// Mock 데이터 정의
const mockCovers = [
  // 완성된 작품들 (contentId가 생성될 예정)
  {
    title: "판타지 모험기: 용의 전설",
    coverImageUrl: "https://picsum.photos/400/300?random=1",
    time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1주일 전
    limit: 5
  },
  {
    title: "미래 도시의 비밀",
    coverImageUrl: "https://picsum.photos/400/300?random=2", 
    time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
    limit: 3
  },
  {
    title: "마법학교 이야기",
    coverImageUrl: "https://picsum.photos/400/300?random=3",
    time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10일 전
    limit: 4
  },
  {
    title: "스팀펑크 세계의 발명가",
    coverImageUrl: "https://picsum.photos/400/300?random=4",
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
    limit: 6
  },
  {
    title: "우주 탐험대의 모험",
    coverImageUrl: "https://picsum.photos/400/300?random=5",
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
    limit: 4
  },
  
  // 작업 중인 캔버스들 (contentId 없음)
  {
    title: "신화 속 영웅들 (작업 중)",
    coverImageUrl: "https://picsum.photos/400/300?random=6",
    time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    limit: 5
  },
  {
    title: "포스트 아포칼립스 (작업 중)",
    coverImageUrl: "https://picsum.photos/400/300?random=7",
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6시간 전
    limit: 3
  },
  {
    title: "해적들의 보물찾기 (작업 중)",
    coverImageUrl: "https://picsum.photos/400/300?random=8",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    limit: 4
  }
];

// 글 내용 템플릿
const storyTemplates = [
  `<h1>서장</h1><p>오래전, 전설 속에서만 들려오던 이야기가 있었다...</p><p>그 시대는 마법과 기술이 공존하는 놀라운 세계였으며, 용감한 영웅들이 악을 물리치기 위해 모험을 떠나곤 했다.</p>`,
  
  `<h1>프롤로그</h1><p>2157년, 인류는 마침내 우주의 끝에 도달했다.</p><p>하지만 그들이 발견한 것은 새로운 시작이었다...</p>`,
  
  `<h1>1장: 입학</h1><p>아르카나 마법학교의 거대한 철문이 열리며, 새로운 학기가 시작되었다.</p><p>수백 명의 학생들이 각자의 꿈을 안고 이곳에 모여들었다.</p>`,
  
  `<h1>기계의 도시</h1><p>증기가 뿜어져 나오는 거대한 기계들 사이로 발명가 에드워드가 걸어갔다.</p><p>그의 손에는 세상을 바꿀 수 있는 놀라운 발명품이 들려있었다.</p>`,
  
  `<h1>출발</h1><p>우주선 아르고호가 미지의 행성을 향해 떠나는 날이 드디어 왔다.</p><p>탐험대원들은 설렘과 불안을 동시에 느끼며 긴 여행을 준비했다.</p>`
];

class MockDataSeeder {
  constructor() {
    this.createdCovers = [];
    this.createdContents = [];
  }

  async seedAllData() {
    console.log('🌱 Mock 데이터 삽입 시작...');
    
    try {
      // 1. 커버 생성
      await this.createCovers();
      
      // 2. 일부 커버를 완성작으로 변환 (content 생성)
      await this.createCompletedContents();
      
      // 3. 작업 중인 캔버스용 룸 생성
      await this.createWorkingRooms();
      
      console.log(' Mock 데이터 삽입 완료!');
      console.log(`📊 생성된 데이터:`);
      console.log(`   - 커버: ${this.createdCovers.length}개`);
      console.log(`   - 완성작: ${this.createdContents.length}개`);
      
      return {
        covers: this.createdCovers,
        contents: this.createdContents
      };
      
    } catch (error) {
      console.error(' Mock 데이터 삽입 실패:', error);
      throw error;
    }
  }

  async createCovers() {
    console.log(' 커버 생성 중...');
    
    for (let i = 0; i < mockCovers.length; i++) {
      const coverData = mockCovers[i];
      
      try {
        console.log(`   Creating cover ${i + 1}/${mockCovers.length}: ${coverData.title}`);
        const response = await api.post('/api/covers', coverData);
        
        this.createdCovers.push({
          ...response.data,
          isCompleted: i < 5 // 처음 5개는 완성작으로 만들 예정
        });
        
        // API 호출 간격 조절 (서버 부하 방지)
        await this.delay(200);
        
      } catch (error) {
        console.error(`   Failed to create cover: ${coverData.title}`, error.message);
      }
    }
    
    console.log(`커버 생성 완료: ${this.createdCovers.length}개`);
  }

  async createCompletedContents() {
    console.log('🎨 완성작 컨텐츠 생성 중...');
    
    const completedCovers = this.createdCovers.filter(cover => cover.isCompleted);
    
    for (let i = 0; i < completedCovers.length; i++) {
      const cover = completedCovers[i];
      
      try {
        console.log(`   Creating content ${i + 1}/${completedCovers.length} for: ${cover.title}`);
        
        // 1. 룸 생성 (글 작성)
        const writingDto = {
          title: cover.title,
          body: storyTemplates[i] || storyTemplates[0],
          depth: 0,
          siblingIndex: 0,
          time: new Date().toISOString()
        };
        
        const roomResponse = await api.post('/api/rooms/create', writingDto);
        console.log(`   Room created for ${cover.title}:`, roomResponse.data.roomId);
        
        // 2. 컨텐츠 조회/생성 (coverId 사용)
        const contentResponse = await api.get(`/api/contents/${cover.id}`);
        console.log(`   Content created for ${cover.title}:`, contentResponse.data.id);
        
        this.createdContents.push({
          ...contentResponse.data,
          coverInfo: cover
        });
        
        await this.delay(300);
        
      } catch (error) {
        console.error(`   Failed to create content for: ${cover.title}`, error.message);
      }
    }
    
    console.log(`완성작 생성 완료: ${this.createdContents.length}개`);
  }

  async createWorkingRooms() {
    console.log(' 작업 중인 룸 생성 중...');
    
    const workingCovers = this.createdCovers.filter(cover => !cover.isCompleted);
    
    for (let i = 0; i < workingCovers.length; i++) {
      const cover = workingCovers[i];
      
      try {
        console.log(`   Creating working room ${i + 1}/${workingCovers.length} for: ${cover.title}`);
        
        const writingDto = {
          title: cover.title,
          body: `<p>${cover.title}의 이야기가 시작됩니다. 함께 작성해보세요!</p>`,
          depth: 0,
          siblingIndex: 0,
          time: new Date().toISOString()
        };
        
        const roomResponse = await api.post('/api/rooms/create', writingDto);
        console.log(`   Working room created: ${roomResponse.data.roomId}`);
        
        await this.delay(300);
        
      } catch (error) {
        console.error(`   Failed to create working room for: ${cover.title}`, error.message);
      }
    }
    
    console.log(`작업 중인 룸 생성 완료`);
  }

  async clearTestData() {
    console.log('🧹 기존 테스트 데이터 정리 중...');
    
    try {
      // 모든 커버 조회
      const response = await api.get('/api/covers/all');
      const covers = response.data || [];
      
      // 테스트 데이터로 보이는 커버들 삭제
      const testKeywords = ['테스트', 'test', 'mock', '작업 중', '판타지', '미래', '마법학교', '스팀펑크', '우주', '신화', '포스트', '해적'];
      
      for (const cover of covers) {
        const isTestData = testKeywords.some(keyword => 
          cover.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (isTestData) {
          try {
            await api.delete(`/api/covers/${cover.id}`);
            console.log(`   Deleted test cover: ${cover.title}`);
            await this.delay(100);
          } catch (error) {
            console.warn(`   Failed to delete cover ${cover.id}:`, error.message);
          }
        }
      }
      
      console.log('테스트 데이터 정리 완료');
      
    } catch (error) {
      console.error(' 테스트 데이터 정리 실패:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSummary() {
    return {
      totalCovers: this.createdCovers.length,
      completedWorks: this.createdContents.length,
      workingCanvases: this.createdCovers.filter(c => !c.isCompleted).length,
      createdCovers: this.createdCovers.map(c => ({
        id: c.id,
        title: c.title,
        isCompleted: c.isCompleted,
        contentId: c.contentId
      })),
      createdContents: this.createdContents.map(c => ({
        id: c.id,
        title: c.title,
        coverId: c.coverInfo?.id
      }))
    };
  }
}

const mockDataSeeder = new MockDataSeeder();

export default mockDataSeeder;