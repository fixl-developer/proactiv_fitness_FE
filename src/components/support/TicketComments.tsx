'use client';

import React, { useState, useEffect } from 'react';
import { supportTicketService, TicketComment } from '@/services/supportTicketService';
import { useAuth } from '@/hooks/useAuth';

interface TicketCommentsProps {
    ticketId: string;
    isStaff?: boolean;
}

export const TicketComments: React.FC<TicketCommentsProps> = ({ ticketId, isStaff = false }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadComments();
    }, [ticketId, page]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const response = await supportTicketService.getComments(ticketId, page, 20);
            if (response.success) {
                setComments(response.data);
                setTotal(response.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await supportTicketService.addComment(ticketId, newComment, isInternal);
            if (response.success) {
                setNewComment('');
                setIsInternal(false);
                setPage(1);
                await loadComments();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await supportTicketService.deleteComment(ticketId, commentId);
            if (response.success) {
                await loadComments();
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Comments</h3>

                {/* Comments List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No comments yet</div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold">{comment.userName}</p>
                                        <p className="text-sm text-gray-600">
                                            {comment.userType === 'staff' ? '👤 Staff' : '👥 Customer'}
                                            {comment.isInternal && ' • Internal Note'}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-gray-700 mb-3">{comment.message}</p>
                                {(isStaff || user?.id === comment.userId) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.commentId)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="border rounded-lg p-4 bg-white">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                    {isStaff && (
                        <label className="flex items-center mb-3">
                            <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm">Internal note (not visible to customer)</span>
                        </label>
                    )}
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Add Comment
                    </button>
                </form>
            </div>
        </div>
    );
};
