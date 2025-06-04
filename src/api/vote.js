export async function getVoteInfo(canvasId) {
  // 실제 API 주소로 교체 필요
  const res = await fetch(`/api/vote/info?canvasId=${canvasId}`);
  if (!res.ok) throw new Error('투표 정보 불러오기 실패');
  return res.json();
}

export async function vote(canvasId, versionId) {
  // 실제 API 주소로 교체 필요
  const res = await fetch(`/api/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ canvasId, versionId }),
  });
  if (!res.ok) throw new Error('투표 실패');
  return res.json();
} 