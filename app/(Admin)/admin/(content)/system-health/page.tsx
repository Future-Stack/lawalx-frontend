'use client';

import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Clock, Zap, AlertTriangle, Database, ChevronRight, Home, Server, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type TabType = 'Performance' | 'Server Status' | 'Uptime Tracking' | 'Error Logs';

// Mock data for API Response Time
const apiResponseData = [
    { time: '00:00', value: 120 },
    { time: '04:00', value: 115 },
    { time: '08:00', value: 180 },
    { time: '12:00', value: 240 },
    { time: '16:00', value: 210 },
    { time: '20:00', value: 130 },
];

// Mock data for Request Throughput
const requestThroughputData = [
    { time: '00:00', value: 800 },
    { time: '04:00', value: 850 },
    { time: '08:00', value: 1200 },
    { time: '12:00', value: 1400 },
    { time: '16:00', value: 1350 },
    { time: '20:00', value: 900 },
];

// Mock data for Service Uptime
const serviceUptimeData = [
    { time: '00:00', api: 99.9, cdn: 99.8, database: 99.7, storage: 99.6 },
    { time: '04:00', api: 99.8, cdn: 99.9, database: 99.8, storage: 99.5 },
    { time: '08:00', api: 99.7, cdn: 99.6, database: 100, storage: 99.4 },
    { time: '12:00', api: 99.9, cdn: 99.8, database: 99.9, storage: 100 },
    { time: '16:00', api: 99.8, cdn: 99.7, database: 99.6, storage: 99.9 },
    { time: '20:00', api: 99.9, cdn: 99.9, database: 99.8, storage: 99.7 },
];

// Mock server data
const serverData = [
    { name: 'API Server 1', location: 'US-East', status: 'Healthy', cpu: 45, memory: 62, uptime: '99.9%', load: 'Normal' },
    { name: 'API Server 2', location: 'US-West', status: 'Healthy', cpu: 38, memory: 58, uptime: '99.8%', load: 'Normal' },
    { name: 'CDN Node 1', location: 'Europe', status: 'Warning', cpu: 78, memory: 85, uptime: '99.6%', load: 'High' },
    { name: 'Database Primary', location: 'US-Central', status: 'Healthy', cpu: 52, memory: 74, uptime: '99.9%', load: 'Normal' },
    { name: 'Storage Cluster', location: 'Global', status: 'Healthy', cpu: 35, memory: 68, uptime: '99.7%', load: 'Normal' },
];

// Mock error logs
const errorLogs = [
    { timestamp: '2023-12-15 14:12:15', level: 'ERROR', service: 'Device Sync', message: 'Failed to sync device TV-003-Clt: Connection timeout', count: 5 },
    { timestamp: '2023-12-15 14:28:42', level: 'WARNING', service: 'Content Upload', message: 'Storage pool nearing capacity threshold (85%)', count: 1 },
    { timestamp: '2023-12-15 14:15:33', level: 'ERROR', service: 'Payment Processing', message: 'Payment gateway timeout for invoice INV-2023-1243', count: 3 },
    { timestamp: '2023-12-15 13:45:21', level: 'WARNING', service: 'CDN', message: 'High latency detected in Europe region (>500ms)', count: 12 },
];

export default function SystemHealth() {
    const [activeTab, setActiveTab] = useState<TabType>('Performance');
    const [isStorageExpanded, setIsStorageExpanded] = useState(true);

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <Link href="/admin/dashboard">
                    <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>System</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-bgBlue dark:text-blue-400 font-medium">System Health & Storage</span>
            </div>

            {/* Header */}
            <div className="mb-6 border-b border-border pb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">System Health & Storage</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monitor infrastructure performance and resource utilization</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Overall Health */}
                <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Health</span>
                        <Activity className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">Operational</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">All systems running normally</div>
                </div>

                {/* System Uptime */}
                {/* <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">System Uptime</span>
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">99.8%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Last 30 days average</div>
                </div> */}

                {/* Response Time */}
                <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Response Time</span>
                        <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">189ms</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Average API response time</div>
                </div>

                {/* Error Rate */}
                <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Error Rate</span>
                        <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0.18%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Within acceptable limits</div>
                </div>
            </div>

            {/* Storage Pool Status */}
            <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border mb-6">
                <button
                    onClick={() => setIsStorageExpanded(!isStorageExpanded)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4 w-full"
                >
                    <Database className="w-4 h-4" />
                    Storage Pool Status
                </button>

                {isStorageExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Video Storage */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Storage</span>
                                <span className="text-xs font-bold bg-gray-900 dark:bg-gray-700 text-white px-2 py-0.5 rounded">80%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-gray-900 dark:bg-gray-400 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">4800 GB / 6000 GB</div>
                        </div>

                        {/* Image Storage */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Storage</span>
                                <span className="text-xs font-bold bg-gray-900 dark:bg-gray-700 text-white px-2 py-0.5 rounded">70%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-gray-900 dark:bg-gray-400 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2100 GB / 3000 GB</div>
                        </div>

                        {/* Audio Storage */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Storage</span>
                                <span className="text-xs font-bold bg-gray-900 dark:bg-gray-700 text-white px-2 py-0.5 rounded">75%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-gray-900 dark:bg-gray-400 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">1500 GB / 2000 GB</div>
                        </div>

                        {/* Backup Storage */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup Storage</span>
                                <span className="text-xs font-bold bg-gray-900 dark:bg-gray-700 text-white px-2 py-0.5 rounded">43%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-gray-900 dark:bg-gray-400 rounded-full" style={{ width: '43%' }}></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">850 GB / 2000 GB</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Infrastructure Monitoring */}
            <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Infrastructure Monitoring</h3>

                {/* Tabs */}
                <div className="bg-navbarBg rounded-full border border-border p-1.5 mb-6 inline-flex gap-2 overflow-x-auto max-w-full">
                    {(['Performance', 'Server Status', 'Error Logs'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 shadow-customShadow ${activeTab === tab
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {/* Performance Tab */}
                    {activeTab === 'Performance' && (
                        <div className="space-y-6">
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* API Response Time */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">API Response Time</h4>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={apiResponseData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" tickLine={false} />
                                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E5E7EB' }} />
                                            <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Request Throughput */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Request Throughput</h4>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={requestThroughputData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} stroke="#E5E7EB" tickLine={false} />
                                            <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E5E7EB' }} />
                                            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorThroughput)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Performance Metrics Summary */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics Summary</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">189ms</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Response Time</div>
                                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Good</span>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1,245/s</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requests per Second</div>
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">Normal</span>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">0.18%</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error Rate</div>
                                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Low</span>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">15.2 GB</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bandwidth Used</div>
                                        <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">Moderate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Server Status Tab */}
                    {activeTab === 'Server Status' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Server</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Location</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">CPU Usage</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Memory Usage</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Uptime</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Load</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serverData.map((server, index) => (
                                        <tr key={index} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Server className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">{server.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{server.location}</td>
                                            <td className="py-3 px-4">
                                                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${server.status === 'Healthy'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${server.status === 'Healthy' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                    {server.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                                                        <div
                                                            className={`h-full rounded-full ${server.cpu > 70 ? 'bg-red-500' : server.cpu > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                            style={{ width: `${server.cpu}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[35px]">{server.cpu}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                                                        <div
                                                            className={`h-full rounded-full ${server.memory > 80 ? 'bg-red-500' : server.memory > 60 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                            style={{ width: `${server.memory}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[35px]">{server.memory}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{server.uptime}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${server.load === 'Normal'
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    {server.load}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Error Logs Tab */}
                    {activeTab === 'Error Logs' && (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Error Logs</h4>
                                    {/* <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Export Logs</button> */}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Timestamp</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Level</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Service</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Message</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {errorLogs.map((log, index) => (
                                                <tr key={index} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{log.timestamp}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${log.level === 'ERROR'
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                                            }`}>
                                                            {log.level}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{log.service}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{log.message}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{log.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Error Trends */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Error Trends</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">23</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Errors (Last 24h)</div>
                                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">+5% from yesterday</span>
                                    </div>
                                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">87</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Warnings (Last 24h)</div>
                                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">+15% from yesterday</span>
                                    </div>
                                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">0.18%</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Error Rate</div>
                                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Within S.L.A</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



// export default function(){
//     return(
//         <>
//             <div className="text-black dark:text-white text-2xl font-semibold">System Health</div>
//         </>
//     )
// }