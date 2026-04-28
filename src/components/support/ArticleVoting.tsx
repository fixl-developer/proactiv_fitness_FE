'use client';

import React, { useState } from 'react';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';

interface ArticleVotingProps {
    articleId: string;
    helpful: number;
    notHelpful: number;
    onVoteChange?: () => void;
}

export const ArticleVoting: React.FC<ArticleVotingProps> = ({ articleId, helpful, notHelpful, onVoteChange }) => {
    const [loading, setLoading] = useState(false);
    const [voted, setVoted] = useState(false);
    const [currentHelpful, setCurrentHelpful] = useState(helpful);
    const [currentNotHelpful, setCurrentNotHelpful] = useState(notHelpful);

    const handleVote = async (voteType: 'helpful' | 'not-helpful') => {
        if (voted) {
            alert('You have already voted on this article');
            return;
        }

        try {
            setLoading(true);
            const response = await knowledgeBaseService.voteArticle(articleId, voteType);
            if (response.success) {
                setVoted(true);
                if (voteType === 'helpful') {
                    setCurrentHelpful(currentHelpful + 1);
                } else {
                    setCurrentNotHelpful(currentNotHelpful + 1);
                }
                onVoteChange?.();
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalVotes = currentHelpful + currentNotHelpful;
    const helpfulPercentage = totalVotes > 0 ? Math.round((currentHelpful / totalVotes) * 100) : 0;

    return (
        <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-semibold mb-3">Was this article helpful?</p>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => handleVote('helpful')}
                    disabled={loading || voted}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:bg-gray-300 disabled:text-gray-600"
                >
                    👍 Helpful ({currentHelpful})
                </button>
                <button
                    onClick={() => handleVote('not-helpful')}
                    disabled={loading || voted}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-gray-300 disabled:text-gray-600"
                >
                    👎 Not Helpful ({currentNotHelpful})
                </button>
            </div>
            {totalVotes > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${helpfulPercentage}%` }}
                            />
                        </div>
                        <span>{helpfulPercentage}% found this helpful</span>
                    </div>
                </div>
            )}
            {voted && <p className="text-sm text-blue-600 mt-2">✓ Thank you for your feedback!</p>}
        </div>
    );
};
