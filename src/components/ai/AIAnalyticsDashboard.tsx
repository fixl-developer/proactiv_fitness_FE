'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    Users,
    MessageCircle,
    Calendar,
    Target,
    Brain,
    BarChart3,
    PieChart,
    Activity,
    Zap,
    AlertCircle,
    CheckCircle,
    Clock,
    Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';

interface AIMetrics {
    chatbotInteractions: number;
    recommendationsGenerated: number;
    bookingConversions: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    automationSavings: number;
}

interface ConversationData {
    date: string;
    interactions: number;
    conversions: number;
    satisfaction: number;
}

interface IntentData {
    intent: string;
    count: number;
    color: string;
}

interface AIInsight {
    id: string;
    type: 'opportunity' | 'warning' | 'success' | 'info';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedActions?: string[];
}

const AIAnalyticsDashboard = () => {
    const [metrics, setMetrics] = useState<AIMetrics | null>(null);
    const [conversationData, setConversationData] = useState<ConversationData[]>([]);
    const [intentData, setIntentData] = useState<IntentData[]>([]);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Mock API calls - Replace with actual API
            const [metricsData, conversationData, intentData, insightsData] = await Promise.all([
                mockGetAIMetrics(timeRange),
                mockGetConversationData(timeRange),
                mockGetIntentData(timeRange),
                mockGetAIInsights(timeRange)
            ]);

            setMetrics(metricsData);
            setConversationData(conversationData);
            setIntentData(intentData);
            setInsights(insightsData);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'opportunity': return <TrendingUp className="h-5 w-5 text-blue-600" />;
            case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
            default: return <Brain className="h-5 w-5 text-gray-600" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
                    <p className="text-gray-600">Real-time insights into AI system performance</p>
                </div>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <Button id={`ai-analytics-timerange-${range}-btn`}
                            key={range}
                            variant={timeRange === range ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimeRange(range)}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.chatbotInteractions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+23%</span> from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.recommendationsGenerated.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+18%</span> from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{((metrics?.bookingConversions || 0) * 100).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+5.2%</span> from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.customerSatisfaction.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+0.3</span> from last period
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Conversation Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Conversation Trends
                        </CardTitle>
                        <CardDescription>Daily AI interactions and conversions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={conversationData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="interactions"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    name="Interactions"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="conversions"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Conversions"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Intent Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            User Intent Distribution
                        </CardTitle>
                        <CardDescription>Most common user intents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={intentData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({ intent, percent }) => `${intent} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {intentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI-Generated Insights
                    </CardTitle>
                    <CardDescription>Automated insights and recommendations for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {insights.map((insight) => (
                            <div key={insight.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {getInsightIcon(insight.type)}
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                                                {insight.impact.toUpperCase()} IMPACT
                                            </span>
                                        </div>
                                    </div>
                                    {insight.actionable && (
                                        <Button id={`ai-analytics-insight-${insight.id}-action-btn`} size="sm" variant="outline">
                                            Take Action
                                        </Button>
                                    )}
                                </div>
                                <p className="text-gray-700 mb-3">{insight.description}</p>
                                {insight.suggestedActions && (
                                    <div>
                                        <h5 className="font-medium text-gray-900 mb-2">Suggested Actions:</h5>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                            {insight.suggestedActions.map((action, index) => (
                                                <li key={index}>{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Response Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {metrics?.averageResponseTime.toFixed(1)}s
                        </div>
                        <p className="text-sm text-gray-600">Average response time</p>
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min((2 / (metrics?.averageResponseTime || 2)) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Target: &lt;2s</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Automation Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">87%</div>
                        <p className="text-sm text-gray-600">Queries handled automatically</p>
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Target: &gt;85%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Cost Savings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            HK${metrics?.automationSavings.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">Monthly savings from automation</p>
                        <p className="text-xs text-green-600 mt-1">
                            ↑ 15% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Mock API functions - Replace with actual API calls
const mockGetAIMetrics = async (timeRange: string): Promise<AIMetrics> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : 3;

    return {
        chatbotInteractions: Math.floor(1247 * multiplier),
        recommendationsGenerated: Math.floor(856 * multiplier),
        bookingConversions: 0.68,
        averageResponseTime: 1.2,
        customerSatisfaction: 4.6,
        automationSavings: Math.floor(15600 * multiplier)
    };
};

const mockGetConversationData = async (timeRange: string): Promise<ConversationData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: ConversationData[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            interactions: Math.floor(Math.random() * 50) + 20,
            conversions: Math.floor(Math.random() * 15) + 5,
            satisfaction: Math.random() * 1 + 4
        });
    }

    return data;
};

const mockGetIntentData = async (timeRange: string): Promise<IntentData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        { intent: 'Booking', count: 45, color: '#3B82F6' },
        { intent: 'Program Info', count: 32, color: '#10B981' },
        { intent: 'Pricing', count: 28, color: '#F59E0B' },
        { intent: 'Location', count: 22, color: '#EF4444' },
        { intent: 'Schedule', count: 18, color: '#8B5CF6' },
        { intent: 'Other', count: 12, color: '#6B7280' }
    ];
};

const mockGetAIInsights = async (timeRange: string): Promise<AIInsight[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
        {
            id: '1',
            type: 'opportunity',
            title: 'Peak Hour Optimization',
            description: '3-4 PM slots show 40% higher conversion rates. Consider adding more classes during this time.',
            impact: 'high',
            actionable: true,
            suggestedActions: [
                'Add 2 more classes during 3-4 PM slot',
                'Offer premium pricing for peak hours',
                'Promote off-peak hours with discounts'
            ]
        },
        {
            id: '2',
            type: 'success',
            title: 'Recommendation Engine Performance',
            description: 'AI recommendations are showing 92% accuracy rate, leading to higher customer satisfaction.',
            impact: 'medium',
            actionable: false
        },
        {
            id: '3',
            type: 'warning',
            title: 'Response Time Increase',
            description: 'Average response time has increased by 0.3s over the past week. Consider optimizing AI model.',
            impact: 'medium',
            actionable: true,
            suggestedActions: [
                'Optimize AI model inference time',
                'Implement response caching',
                'Scale up server resources'
            ]
        }
    ];
};

export default AIAnalyticsDashboard;
