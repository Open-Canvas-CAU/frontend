import React from 'react';
import VoteButton from './VoteButton';

const VoteSection = ({
  voteDeadline,
  onVote,
  hasVoted,
  loading,
  isDeadlinePassed,
  winnerVersion,
}) => (
  <section className="mt-8 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
    <h3 className="font-bold mb-3 text-lg">투표</h3>
    <div className="mb-2">
      {isDeadlinePassed
        ? <span className="text-red-500">투표가 마감되었습니다.</span>
        : <span>투표 마감: {voteDeadline ? new Date(voteDeadline).toLocaleString() : '-'}</span>
      }
    </div>
    {!isDeadlinePassed && !hasVoted && (
      <div className="flex gap-4">
        <VoteButton onClick={() => onVote('version1')} disabled={loading} color="blue">
          버전 1에 투표
        </VoteButton>
        <VoteButton onClick={() => onVote('version2')} disabled={loading} color="green">
          버전 2에 투표
        </VoteButton>
      </div>
    )}
    {hasVoted && !isDeadlinePassed && (
      <div className="text-green-600 mt-2">투표해주셔서 감사합니다!</div>
    )}
    {isDeadlinePassed && (
      <div className="mt-2">
        <VoteButton color="gray" disabled>
          {winnerVersion ? `승리: ${winnerVersion === 'version1' ? '버전 1' : '버전 2'}` : '결과 집계 중'}
        </VoteButton>
      </div>
    )}
  </section>
);

export default VoteSection; 