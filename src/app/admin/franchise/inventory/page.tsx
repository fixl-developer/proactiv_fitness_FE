'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package, Plus, Edit2, Trash2, Eye, AlertTriangle, CheckCircle,
    TrendingDown, Zap, Search, Filter, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function InventoryManagementPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [inventory, setInventory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchInventory()
    }, [searchTerm, filterCategory, filterStatus])

    const fetchInventory = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data
            setInventory([
                {
                    id: '1',
                    name: 'Gymnastics Mats',
                    category: 'Equipment',
                    quantity: 45,
                    minStock: 20,
                    maxStock: 100,
                    unitCost: 150,
                    totalValue: 6750,
                    status: 'OPTIMAL',
                    lastRestocked: '2024-03-10',
                    supplier: 'Sports Equipment Co'
                },
                {
                    id: '2',
                    name: 'Foam Blocks',
                    category: 'Equipment',
                    quantity: 8,
                    minStock: 15,
                    maxStock: 50,
                    unitCost: 45,
                    totalValue: 360,
                    status: 'LOW',
                    lastRestocked: '2024-02-15',
                    supplier: 'Sports Equipment Co'
                },
                {
                    id: '3',
                    name: 'Cleaning Supplies',
                    category: 'Supplies',
                    quantity: 120,
                    minStock: 50,
                    maxStock: 200,
                    unitCost: 12,
                    totalValue: 1440,
                    status: 'OPTIMAL',
                    lastRestocked: '2024-03-05',
                    supplier: 'Janitorial Supplies Inc'
                },
                {
                    id: '4',
                    name: 'First Aid Kits',
                    category: 'Safety',
                    quantity: 3,
                    minStock: 5,
                    maxStock: 15,
                    unitCost: 85,
                    totalValue: 255,
                    status: 'CRITICAL',
                    lastRestocked: '2024-01-20',
                    supplier: 'Medical Supplies Ltd'
                },
                {
                    id: '5',
                    name: 'Uniforms (Small)',
                    category: 'Apparel',
                    quantity: 25,
                    minStock: 10,
                    maxStock: 50,
                    unitCost: 35,
                    totalValue: 875,
                    status: 'OPTIMAL',
                    lastRestocked: '2024-03-01',
                    supplier: 'Uniform Supplier Co'
                },
            ])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const categories = ['all', ...new Set(inventory.map(i => i.category))]
    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)
    const lowStockItems = inventory.filter(i => i.quantity <= i.minStock).length
    const criticalItems = inventory.filter(i => i.status === 'CRITICAL').length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600 mt-1">Track equipment and supplies</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Items',
                        value: inventory.length.toString(),
                        icon: Package,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Inventory Value',
                        value: `$${(totalInventoryValue / 1000).toFixed(1)}K`,
                        icon: Zap,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Low Stock',
                        value: lowStockItems.toString(),
                        icon: TrendingDown,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                    {
                        title: 'Critical',
                        value: criticalItems.toString(),
                        icon: AlertTriangle,
                        color: 'text-red-600',
                        bgColor: 'bg-red-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="optimal">Optimal</option>
                            <option value="low">Low Stock</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Cost</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Value</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, idx) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">{item.category}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{item.quantity}</span>
                                                <span className="text-xs text-gray-600">
                                                    ({item.minStock}-{item.maxStock})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-gray-600">${item.unitCost}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">${item.totalValue}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                variant={
                                                    item.status === 'OPTIMAL'
                                                        ? 'default'
                                                        : item.status === 'LOW'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                }
                                            >
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Low Stock Alert */}
            {lowStockItems > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-orange-900">Low Stock Alert</p>
                                <p className="text-xs text-orange-700 mt-1">
                                    {lowStockItems} item(s) are below minimum stock level. Please reorder soon.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">⚠️ {error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
