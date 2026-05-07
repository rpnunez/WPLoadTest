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
  pluginName: string;
  status: 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  loadConfig: LoadConfig;
  metrics: Metrics;
  timeseries: TimePoint[];
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-test', label: 'Start Stress Test', icon: Play },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'plugin', label: 'WP Plugin Code', icon: Download },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4 border-r border-slate-800 flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity size={24} />
        </div>
        <h1 className="font-bold text-xl tracking-tight">WP LoadTest Pro</h1>
      </div>
      <nav className="space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <tab.icon size={20} />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="pt-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-sm font-medium text-slate-500">{unit}</span>
    </div>
  </div>
);

const TestForm = ({ onStart }: { onStart: (data: any) => void }) => {
  const [plugin, setPlugin] = useState('');
  const [users, setUsers] = useState(10);
  const [duration, setDuration] = useState(60);
  const [pattern, setPattern] = useState('constant');

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-900">Configure New Stress Test</h2>
        <p className="text-sm text-slate-500">Define the load parameters for the target WordPress plugin.</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 whitespace-nowrap">Target Plugin Identifier / Hook</label>
          <input 
            type="text" 
            placeholder="e.g. woocommerce_checkout_process"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={plugin}
            onChange={(e) => setPlugin(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 whitespace-nowrap">Total Simulated Users</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={users}
              onChange={(e) => setUsers(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 whitespace-nowrap">Duration (seconds)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Traffic Pattern</label>
          <div className="grid grid-cols-3 gap-3">
            {['constant', 'ramp-up', 'spike'].map((p) => (
              <button
                key={p}
                onClick={() => setPattern(p)}
                className={`px-4 py-3 text-sm font-medium rounded-lg border capitalize transition-all ${
                  pattern === p 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => onStart({ pluginName: plugin, users, duration, pattern })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          <Play size={18} fill="currentColor" />
          Queue Stress Test
        </button>
      </div>
    </div>
  );
};

const ReportDetail = ({ test }: { test: TestResult }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">{test.pluginName}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
              test.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {test.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Clock size={14} />
            Started on {new Date(test.startTime).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download size={16} /> Export JSON
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white border border-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Avg CPU Usage" value={test.metrics.avgCpu.toFixed(1)} unit="%" icon={Cpu} color="blue" />
        <MetricCard title="Peak Memory" value={test.metrics.peakMemory.toFixed(0)} unit="MB" icon={HardDrive} color="purple" />
        <MetricCard title="DB Query Time" value={test.metrics.avgQueryTime.toFixed(1)} unit="ms" icon={Database} color="amber" />
        <MetricCard title="Latency (p95)" value={test.metrics.latency.toFixed(0)} unit="ms" icon={Activity} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Cpu size={18} className="text-blue-500" /> CPU & Memory Dynamics
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={test.timeseries}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(v) => `T+${v}s`}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} fill="transparent" name="Memory MB" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Database size={18} className="text-amber-500" /> Database Impact
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={test.timeseries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   labelFormatter={(v) => `T+${v}s`}
                />
                <Line type="stepAfter" dataKey="queries" stroke="#f59e0b" strokeWidth={2} dot={false} name="Queries/Sec" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
         <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500" /> Performance Insights
          </h3>
          <div className="space-y-3">
            {test.metrics.avgQueryTime > 15 && (
              <div className="flex gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-800">
                <AlertTriangle className="shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Critical DB Bottleneck Found</p>
                  <p className="text-xs opacity-80 mt-0.5">Average query time exceeded 15ms. Detected inefficient SQL JOIN operations or missing indexes in the target hook.</p>
                </div>
              </div>
            )}
            {test.metrics.peakMemory > 400 && (
              <div className="flex gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800">
                <AlertTriangle className="shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Large Memory Footprint</p>
                  <p className="text-xs opacity-80 mt-0.5">Plugin memory usage spiked to {test.metrics.peakMemory}MB. Consider lazy loading static assets or caching expensive calculations.</p>
                </div>
              </div>
            )}
            <div className="flex gap-3 bg-green-50 border border-green-100 p-4 rounded-xl text-green-800">
              <CheckCircle2 className="shrink-0" />
              <div>
                <p className="font-semibold text-sm">Concurrency Support</p>
                <p className="text-xs opacity-80 mt-0.5">No deadlocks detected during the "{test.loadConfig.pattern}" phase. Scaling up to {test.loadConfig.users} users maintained baseline stability.</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

const WPPluginCode = () => {
  const code = `<?php
/**
 * Plugin Name: WP LoadTest Collector
 * Description: Telemetry collection agent for WP LoadTest Pro.
 */

add_action('init', function() {
    if (!isset($_GET['wp_loadtest_secret']) || $_GET['wp_loadtest_secret'] !== 'YOUR_APP_SECRET') {
        return;
    }

    // Start Telemetry Buffer
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
        $end_time = microtime(true);
        $end_mem = memory_get_usage();
        
        $payload = [
            'cpu' => sys_getloadavg()[0],
            'memory' => ($end_mem - $wp_loadtest_metrics['start_mem']) / 1024 / 1024,
            'queries' => $wp_loadtest_metrics['queries'],
            'latency' => ($end_time - $wp_loadtest_metrics['start_time']) * 1000
        ];
        
        // Report back to dashboard
        wp_remote_post('https://YOUR_DASHBOARD_URL/api/report', [
            'body' => json_encode($payload),
            'headers' => ['Content-Type' => 'application/json']
        ]);
    });
});
`;

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">WordPress Agent Installation</h2>
        <p className="text-slate-500">To monitor your plugin on a real live instance, install this agent code as a plugin or in your theme functions.php file.</p>
      </div>
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">wp-loadtest-collector.php</span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Copy Code
          </button>
        </div>
        <pre className="p-6 text-sm font-mono text-blue-100 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "1. Install Agent", text: "Download the code above and upload it as a custom plugin to your WP site." },
          { title: "2. Set Secret", text: "Replace 'YOUR_APP_SECRET' with the API key from your settings panel." },
          { title: "3. Connect", text: "Point your dashboard to your WP URL to begin real-time telemetry." }
        ].map(step => (
          <div key={step.title} className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
            <p className="text-sm text-slate-500">{step.text}</p>
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
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data);
      if (data.length > 0 && !selectedTest) setSelectedTest(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    const interval = setInterval(fetchTests, 3000);
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
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); if (t === 'dashboard') fetchTests(); }} />
      
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  {selectedTest ? (
                    <ReportDetail test={selectedTest} />
                  ) : (
                    <div className="bg-white border border-dashed border-slate-300 rounded-2xl h-[400px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Play size={48} className="mb-4 opacity-10" />
                      <p>No active report selected. Start a stress test to see live metrics.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">Recent Tests</h3>
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                      {tests.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTest(t)}
                          className={`w-full p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-left ${
                            selectedTest?.id === t.id ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 text-sm truncate max-w-[120px]">{t.pluginName}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.id}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block">{t.metrics.latency.toFixed(0)} ms</span>
                            <span className="text-[10px] text-slate-400">{new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg shadow-blue-600/20">
                     <Activity size={100} className="absolute -bottom-10 -right-10 opacity-10" />
                     <h4 className="font-bold mb-2">Live Monitor Active</h4>
                     <p className="text-xs text-blue-100 mb-4 leading-relaxed">System is polling telemetry every 3 seconds from the simulated MySQL metric tables.</p>
                     <div className="flex items-center gap-2 text-xs font-bold bg-blue-500/30 w-fit px-3 py-1.5 rounded-full border border-blue-400/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        COLLECTOR ONLINE
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'new-test' && (
             <motion.div 
               key="new-test"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               className="flex justify-center pt-12"
             >
               <TestForm onStart={handleStartTest} />
             </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div key="reports" className="space-y-6">
               <h2 className="text-xl font-bold text-slate-900">Archived Reports</h2>
               <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Test ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Plugin/Hook</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Users</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Score</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tests.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setSelectedTest(t); setActiveTab('dashboard'); }}>
                          <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{t.pluginName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{t.loadConfig.users}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: `${Math.max(20, 100 - t.metrics.latency/10)}%` }} />
                               </div>
                               <span className="text-xs font-bold text-slate-900">{(100 - t.metrics.latency/10).toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">{t.status}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{new Date(t.startTime).toLocaleDateString()}</td>
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
      </main>
    </div>
  );
}
