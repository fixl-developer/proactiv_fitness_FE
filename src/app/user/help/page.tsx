'use client';

import React, { useState, useEffect } from 'react';
import { knowledgeBaseService, KnowledgeBaseArticle } from '@/services/knowledgeBaseService';
import { ArticleVoting } from '@/components/support/ArticleVoting';

export default function HelpCenterPage() {
    const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<KnowledgeBaseArticle[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadArticles();
    }, [selectedCategory, page]);

    const loadArticles = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (selectedCategory) filters.category = selectedCategory;

            const response = await knowledgeBaseService.getArticles(page, 12, filters);
            if (response.success) {
                setArticles(response.data);
                setTotal(response.pagination?.total || 0);

                // Extract unique categories
                const cats = new Set<string>();
                response.data.forEach((article: KnowledgeBaseArticle) => {
                    cats.add(article.category);
                });
                setCategories(Array.from(cats));
            }
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setPage(1);
            await loadArticles();
            return;
        }

        try {
            setLoading(true);
            const response = await knowledgeBaseService.searchArticles(searchQuery, 1, 12);
            if (response.success) {
                setArticles(response.data);
                setTotal(response.pagination?.total || 0);
                setPage(1);
            }
        } catch (error) {
            console.error('Error searching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectArticle = async (article: KnowledgeBaseArticle) => {
        setSelectedArticle(article);
        try {
            const response = await knowledgeBaseService.getRelatedArticles(article._id || '', 5);
            if (response.success) {
                setRelatedArticles(response.data);
            }
        } catch (error) {
            console.error('Error loading related articles:', error);
        }
    };

    const handleVoteChange = () => {
        // Refresh the article to get updated vote counts
        if (selectedArticle?._id) {
            knowledgeBaseService.getArticleById(selectedArticle._id).then((response) => {
                if (response.success) {
                    setSelectedArticle(response.data);
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Help Center</h1>
                    <p className="text-gray-600">Find answers to your questions</p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-4 sticky top-4">
                            <h3 className="font-semibold mb-4">Categories</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded ${selectedCategory === ''
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    All Articles
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setPage(1);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded ${selectedCategory === category
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {selectedArticle ? (
                            // Article Detail View
                            <div className="bg-white rounded-lg p-8">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-blue-600 hover:text-blue-800 mb-4"
                                >
                                    ← Back to Articles
                                </button>

                                <h1 className="text-3xl font-bold mb-4">{selectedArticle.title}</h1>

                                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                                    <span>By {selectedArticle.author}</span>
                                    <span>•</span>
                                    <span>{selectedArticle.views} views</span>
                                    <span>•</span>
                                    <span>{new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="prose max-w-none mb-8">
                                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                                </div>

                                {/* Voting */}
                                <ArticleVoting
                                    articleId={selectedArticle._id || ''}
                                    helpful={selectedArticle.helpful}
                                    notHelpful={selectedArticle.notHelpful}
                                    onVoteChange={handleVoteChange}
                                />

                                {/* Related Articles */}
                                {relatedArticles.length > 0 && (
                                    <div className="mt-8 pt-8 border-t">
                                        <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {relatedArticles.map((article) => (
                                                <button
                                                    key={article._id}
                                                    onClick={() => handleSelectArticle(article)}
                                                    className="text-left p-4 border rounded-lg hover:bg-blue-50 transition"
                                                >
                                                    <h4 className="font-semibold text-blue-600 hover:text-blue-800">
                                                        {article.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {article.content.substring(0, 100)}...
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Articles List View
                            <div>
                                {loading ? (
                                    <div className="text-center py-8">Loading articles...</div>
                                ) : articles.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No articles found</div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            {articles.map((article) => (
                                                <button
                                                    key={article._id}
                                                    onClick={() => handleSelectArticle(article)}
                                                    className="text-left bg-white rounded-lg p-6 hover:shadow-lg transition border"
                                                >
                                                    {article.featured && (
                                                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2">
                                                            Featured
                                                        </span>
                                                    )}
                                                    <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {article.content.substring(0, 150)}...
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>{article.category}</span>
                                                        <span>👍 {article.helpful}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {total > 12 && (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => setPage(Math.max(1, page - 1))}
                                                    disabled={page === 1}
                                                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:bg-gray-100"
                                                >
                                                    Previous
                                                </button>
                                                <span className="px-4 py-2">
                                                    Page {page} of {Math.ceil(total / 12)}
                                                </span>
                                                <button
                                                    onClick={() => setPage(page + 1)}
                                                    disabled={page >= Math.ceil(total / 12)}
                                                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:bg-gray-100"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
