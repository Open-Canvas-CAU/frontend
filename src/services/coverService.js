import api from './api'

export const coverService = {
  getAllCovers: () => api.get('/api/covers/all'),
  
  getCoversByViews: () => api.get('/api/covers/views'),
  
  getCoversByLikes: () => api.get('/api/covers/likes'),
  
  searchCovers: (keyword) => api.get(`/api/covers/search?arg0=${encodeURIComponent(keyword)}`),
  
  createCover: (coverData) => api.post('/api/covers', coverData),
  
  deleteCover: (id) => api.delete(`/api/covers/${id}`),

  getWorkingOnCovers: () => api.get('/api/covers/working-on')
} 