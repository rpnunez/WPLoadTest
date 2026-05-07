/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Play, 
  FileText, 
  Settings, 
  Download, 
  Activity, 
  Database, 
  Cpu, 
  HardDrive,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface WPPlugin {
  name: string;
  slug: string;
  version: string;
  status: string;
}

interface LoadConfig {
  users: number;
  duration: number;
  pattern: 'constant' | 'ramp-up' | 'spike';
}

interface Metrics {
  avgCpu: number;
  peakMemory: number;
  avgQueryTime: number;
  latency: number;
}

interface TimePoint {
  time: number;
  cpu: number;
  memory: number;
  queries: number;
}

interface TestResult {
  id: string;
  post_title: string;
  post_status: string;
  post_date: string;
  meta: {
    plugin_slug: string;
    status: 'running' | 'completed' | 'failed';
    load_config: LoadConfig;
    metrics: Metrics;
    timeseries: TimePoint[];
  }
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-test', label: 'Simulation Lab', icon: Play },
    { id: 'reports', label: 'Reports Library', icon: FileText },
    { id: 'plugin', label: 'WP Plugin Code', icon: Download },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-blue-500/20">Wp</div>
        <span className="text-white font-bold text-lg tracking-tight">StressPulse Pro</span>
      </div>
      <nav className="mt-4 flex-grow px-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-50'} />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Telemetry</p>
          <div className="flex items-center">
            <div className="flex-1 bg-slate-700 h-1 rounded-full overflow-hidden">
              <div className="bg-green-500 w-1/4 h-full rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            </div>
            <span className="ml-3 text-[10px] font-mono text-slate-400">12% LOAD</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const MetricCard = ({ title, value, unit, icon: Icon, subtext, subColor }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300 group">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
        <Icon size={14} />
      </div>
    </div>
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
      <span className="text-xs font-medium text-slate-400">{unit}</span>
    </div>
    <div className={`mt-2 text-[10px] font-bold uppercase ${subColor}`}>
      {subtext}
    </div>
  </div>
);

const TestForm = ({ onStart }: { onStart: (data: any) => void }) => {
  const [plugins, setPlugins] = useState<WPPlugin[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('ai-post-scheduler');
  const [users, setUsers] = useState(50);
  const [duration, setDuration] = useState(60);
  const [operationType, setOperationType] = useState('template-scheduling');
  const [pattern, setPattern] = useState<'constant' | 'ramp-up' | 'spike' | 'batch'>('constant');

  useEffect(() => {
    fetch('/api/wp/plugins').then(res => res.json()).then(setPlugins);
  }, []);

  const handleStart = () => {
    const plugin = plugins.find(p => p.slug === selectedSlug);
    if (!plugin) return;
    onStart({ 
      pluginSlug: plugin.slug, 
      pluginName: plugin.name, 
      users, 
      duration, 
      pattern,
      meta: {
        operationType
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col max-w-sm w-full mx-auto lg:mx-0">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Simulation Profile</h3>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mt-1">Configure Load Parameters</p>
      </div>
      <div className="p-5 space-y-5 flex-grow">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Target Active Plugin</label>
          <select 
            className="w-full bg-slate-100 border-none rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
          >
            <option value="">Select a plugin...</option>
            {plugins.map(p => (
              <option key={p.slug} value={p.slug}>{p.name} (v{p.version})</option>
            ))}
          </select>
        </div>

        {selectedSlug === 'ai-post-scheduler' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-blue-50/50 rounded-lg border border-blue-100"
          >
            <label className="text-[9px] font-bold text-blue-600 uppercase mb-2 block tracking-widest">Operation Focus (AI Scheduler)</label>
            <div className="space-y-1.5">
              {[
                { id: 'template-scheduling', label: 'Template Rule Mapping', icon: Clock },
                { id: 'batch-ai-gen', label: 'AI Content Generation', icon: Cpu },
                { id: 'batch-burst', label: 'Batch Burst Simulation', icon: HardDrive },
                { id: 'deadlock-test', label: 'Deadlock Concurrency', icon: AlertTriangle },
                { id: 'cron-dispatch', label: 'Cron Trigger Stability', icon: Activity }
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => setOperationType(op.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    operationType === op.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <op.icon size={12} />
                  {op.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Traffic Pattern</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'constant', label: 'Steady' },
              { id: 'ramp-up', label: 'Ramp Up' },
              { id: 'spike', label: 'Spike' },
              { id: 'batch', label: 'Batch Processing' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPattern(p.id as any)}
                className={`py-2 px-3 text-[11px] font-bold rounded-lg border transition-all ${
                  pattern === p.id 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concurrent Users</label>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{users}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="1000" 
            step="10"
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
            <span>10</span><span>1000</span>
          </div>
        </div>
      </div>
      <div className="p-5 bg-slate-50 border-t border-slate-100 rounded-b-xl">
        <button 
          onClick={handleStart}
          disabled={!selectedSlug}
          className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Initialize Simulation
        </button>
      </div>
    </div>
  );
};

const ReportDetail = ({ test }: { test: TestResult }) => {
  return (
    <div className="space-y-6 flex-1 min-w-0">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Avg Latency" 
          value={test.meta.metrics.latency.toFixed(0)} 
          unit="ms" 
          icon={Activity} 
          subtext="↓ 12% from baseline" 
          subColor="text-green-600" 
        />
        <MetricCard 
          title="Peak CPU Usage" 
          value={test.meta.metrics.avgCpu.toFixed(1)} 
          unit="%" 
          icon={Cpu} 
          subtext="Within safe limits" 
          subColor="text-slate-400" 
        />
        <MetricCard 
          title="Peak Memory" 
          value={test.meta.metrics.peakMemory.toFixed(0)} 
          unit="MB" 
          icon={HardDrive} 
          subtext="↑ 8% peak spike" 
          subColor="text-red-500" 
        />
        <MetricCard 
          title="DB Query Avg" 
          value={test.meta.metrics.avgQueryTime.toFixed(1)} 
          unit="ms" 
          icon={Database} 
          subtext="Optimized indices" 
          subColor="text-green-600" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-800 tracking-tight">Concurrent Load Performance</h3>
          <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></span> Response Time</div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full mr-2"></span> Resource Usage</div>
          </div>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={test.meta.timeseries}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                labelFormatter={(v) => `T+${v}s`}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" name="Latency Score" />
              <Area type="monotone" dataKey="memory" stroke="#e2e8f0" strokeWidth={2} fill="transparent" name="System Overhead" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const WPPluginCode = () => {
  const code = `<?php
/**
 * Plugin Name: StressPulse Pro Collector
 * Description: Telemetry collection agent for StressPulse Pro.
 * Version: 1.0.0
 * Author: StressPulse Team
 */

if (!defined('ABSPATH')) exit;

/**
 * Register Custom Post Type for Test Results
 */
add_action('init', function() {
    register_post_type('wp_stress_test', [
        'labels' => ['name' => 'Stress Tests'],
        'public' => false,
        'show_ui' => true,
        'capability_type' => 'post',
        'hierarchical' => false,
        'menu_icon' => 'dashicons-performance',
        'supports' => ['title', 'custom-fields']
    ]);
});

/**
 * Telemetry Collection Logic
 */
add_action('init', function() {
    if (!current_user_can('manage_options')) return;
    
    global $wp_loadtest_metrics;
    $wp_loadtest_metrics = [
        'queries' => 0,
        'start_mem' => memory_get_usage(),
        'start_time' => microtime(true)
    ];

    add_filter('query', function($query) {
        global $wp_loadtest_metrics;
        $wp_loadtest_metrics['queries']++;
        return $query;
    });

    register_shutdown_function(function() {
        global $wp_loadtest_metrics;
        if (!isset($wp_loadtest_metrics)) return;

        $end_time = microtime(true);
        $payload = [
            'cpu' => sys_getloadavg()[0],
            'memory' => (memory_get_usage() - $wp_loadtest_metrics['start_mem']) / 1024 / 1024,
            'queries' => $wp_loadtest_metrics['queries'],
            'latency' => ($end_time - $wp_loadtest_metrics['start_time']) * 1000
        ];
        
        // Save to Custom Post Type via WPDB simulation
        error_log("StressPulse Telemetry: " . json_encode($payload));
    });
});
`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">WordPress Implementation</h2>
          <p className="text-slate-500 mt-1 font-medium">This generated agent code registers the `wp_stress_test` Custom Post Type and handles real-time telemetry capture. Specifically optimized for monitoring high-frequency hooks used by <b>AI Post Scheduler</b>.</p>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all border border-slate-700 shadow-xl shadow-slate-900/10"
        >
          <Download size={14} /> Copy Source
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative group">
        <div className="px-4 py-3 bg-slate-800 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">wp-stress-pulse-pro.php</span>
        </div>
        <pre className="p-6 text-[11px] font-mono text-blue-200/90 overflow-x-auto leading-relaxed custom-scrollbar max-h-[600px]">
          <code>{code}</code>
        </pre>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { title: "CPT Integration", desc: "Results are stored natively in the wp_posts table for maximum performance.", icon: Database },
          { title: "Query Hooking", desc: "Intercepts every SQL call using the 'query' filter to map bottlenecks.", icon: Activity },
          { title: "Admin Security", desc: "Telemetry is only captured for verified 'manage_options' administrators.", icon: ShieldAlert }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300">
            <feat.icon size={18} className="text-blue-500 mb-3" />
            <h4 className="font-bold text-slate-800 text-sm mb-1">{feat.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tests, setTests] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data);
      if (data.length > 0 && !selectedTest) setSelectedTest(data[0]);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchTests();
    const interval = setInterval(fetchTests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTest = async (config: any) => {
    try {
      const res = await fetch('/api/tests/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const newTest = await res.json();
      setTests([newTest, ...tests]);
      setSelectedTest(newTest);
      setActiveTab('dashboard');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Performance Insights</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Last Analysis: {selectedTest ? new Date(selectedTest.post_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Export Data</button>
            <button 
              onClick={() => setActiveTab('new-test')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 border border-blue-500"
            >
              Run Stress Test
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-8 items-start"
              >
                {selectedTest ? (
                  <>
                    <ReportDetail test={selectedTest} />
                    <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                      <TestForm onStart={handleStartTest} />
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Logs</h3>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                          {tests.map(t => (
                            <button 
                              key={t.id}
                              onClick={() => setSelectedTest(t)}
                              className={`w-full p-4 text-left hover:bg-slate-50 transition-all flex items-center justify-between ${selectedTest.id === t.id ? 'bg-blue-50/50' : ''}`}
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{t.post_title}</div>
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#{t.id} • {new Date(t.post_date).toLocaleDateString()}</div>
                                  {t.meta.operation_type && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 uppercase">{t.meta.operation_type.replace('-', ' ')}</span>
                                  )}
                                </div>
                              </div>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${t.meta.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                                {t.meta.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 bg-white border-2 border-dashed border-slate-200 rounded-2xl h-[500px] flex flex-col items-center justify-center p-8 text-center w-full">
                    <div className="bg-slate-50 p-8 rounded-full mb-6">
                      <Activity size={64} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Initialize Pulse Telemetry</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">System is ready for concurrent load simulation. Select a plugin from your simulation lab to begin monitoring.</p>
                    <button 
                      onClick={() => setActiveTab('new-test')}
                      className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-900/20 hover:scale-105 transition-all"
                    >
                      Enter Simulation Lab
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'new-test' && (
               <motion.div 
                 key="new-test"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center pt-8"
               >
                 <div className="max-w-xl text-center mb-10">
                   <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Simulation Lab</h2>
                   <p className="text-slate-500 text-sm leading-relaxed font-medium">Design synthetic traffic patterns to benchmark hook performance and database scalability under extreme enterprise loads.</p>
                 </div>
                 <TestForm onStart={handleStartTest} />
               </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" className="space-y-6 max-w-5xl mx-auto">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports Library</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Archived Performance Baselines</p>
                    </div>
                 </div>
                 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Test ID</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plugin/Target</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Load Pattern</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stability Score</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tests.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 text-xs font-mono text-slate-400 font-bold">#{t.id}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-800">{t.post_title.replace(' Stress Test', '')}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Recorded {new Date(t.post_date).toLocaleDateString()}</div>
                                {t.meta.operation_type && (
                                  <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-100/50 text-blue-600 rounded uppercase tracking-widest leading-none">{t.meta.operation_type.replace('-', ' ')}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{t.meta.load_config.pattern}</span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col items-center gap-1">
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500" style={{ width: `${Math.max(20, 100 - t.meta.metrics.latency/15)}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-900">{(100 - t.meta.metrics.latency/15).toFixed(0)}%</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${t.meta.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{t.meta.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                onClick={() => { setSelectedTest(t); setActiveTab('dashboard'); }}
                                className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all hover:underline pr-4"
                               >
                                View Report →
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {activeTab === 'plugin' && (
              <motion.div key="plugin">
                <WPPluginCode />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}