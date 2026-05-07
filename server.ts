import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store simulating WPDB and Custom Post Types
  const wordpressPlugins = [
    { name: "AI Post Scheduler", slug: "ai-post-scheduler", version: "2.1.4", status: "active" },
    { name: "WooCommerce", slug: "woocommerce", version: "8.5.0", status: "active" },
    { name: "Yoast SEO", slug: "wordpress-seo", version: "22.0", status: "active" },
    { name: "Elementor", slug: "elementor", version: "3.19.0", status: "active" },
    { name: "Contact Form 7", slug: "contact-form-7", version: "5.8.7", status: "active" },
    { name: "Jetpack", slug: "jetpack", version: "13.0", status: "inactive" }
  ];

  const testResults: any[] = [
    {
      id: "742", // Simulating a WP Post ID
      post_title: "WooCommerce Stress Test",
      post_status: "publish",
      post_date: new Date(Date.now() - 3600000).toISOString(),
      meta: {
        plugin_slug: "woocommerce",
        status: "completed",
        load_config: { users: 50, duration: 60, pattern: "ramp-up" },
        metrics: { avgCpu: 42.5, peakMemory: 512, avgQueryTime: 12.4, latency: 185 },
        timeseries: Array.from({ length: 20 }, (_, i) => ({
          time: i * 5,
          cpu: 20 + Math.random() * 40,
          memory: 128 + Math.random() * 256,
          queries: 5 + Math.random() * 10
        }))
      }
    }
  ];

  // API Routes
  app.get("/api/wp/plugins", (req, res) => {
    res.json(wordpressPlugins.filter(p => p.status === "active"));
  });

  app.get("/api/tests", (req, res) => {
    res.json(testResults);
  });

  app.get("/api/tests/:id", (req, res) => {
    const test = testResults.find(t => t.id === req.params.id);
    if (!test) return res.status(404).json({ error: "Post not found" });
    res.json(test);
  });

  app.post("/api/tests/start", (req, res) => {
    const { pluginSlug, pluginName, users, duration, pattern, meta: requestMeta } = req.body;
    const postId = Math.floor(Math.random() * 1000).toString();
    const opType = requestMeta?.operationType || 'general';

    const newTest = {
      id: postId,
      post_title: `${pluginName} Stress Test`,
      post_status: "publish",
      post_date: new Date().toISOString(),
      meta: {
        plugin_slug: pluginSlug,
        status: "running",
        load_config: { users, duration, pattern },
        operation_type: opType,
        metrics: { avgCpu: 0, peakMemory: 0, avgQueryTime: 0, latency: 0 },
        timeseries: []
      }
    };
    testResults.unshift(newTest);
    
    // Simulate background processing (WP Cron style)
    setTimeout(() => {
      const test = testResults.find(t => t.id === postId);
      if (test) {
        let cpuBase = 35, memBase = 128, queryBase = 8, latencyBase = 120;
        
        // Target adjustments for AI Post Scheduler
        if (pluginSlug === 'ai-post-scheduler') {
          if (opType === 'template-scheduling') {
            cpuBase = 65; // Rule mapping is CPU intensive
            latencyBase = 250;
          } else if (opType === 'batch-ai-gen') {
            memBase = 600; // AI generation is memory heavy
            cpuBase = 80;
          } else if (opType === 'cron-dispatch') {
            latencyBase = 400; // Background tasks have higher jitter
            queryBase = 25;
          } else if (opType === 'batch-burst') {
            cpuBase = 85; 
            memBase = 800; // Burst mode consumes significant RAM
            queryBase = 15;
            latencyBase = 300;
          } else if (opType === 'deadlock-test') {
            cpuBase = 40; 
            queryBase = 120; // Excessive queries simulating locking
            latencyBase = 1200; // Simulating wait states/timeouts
          }
        }

        test.meta.status = "completed";
        test.meta.metrics = {
          avgCpu: cpuBase + Math.random() * 20,
          peakMemory: memBase + Math.random() * 200,
          avgQueryTime: queryBase + Math.random() * 10,
          latency: latencyBase + Math.random() * 200
        };
        test.meta.timeseries = Array.from({ length: 20 }, (_, i) => ({
          time: i * 5,
          cpu: cpuBase - 10 + Math.random() * 30,
          memory: memBase - 50 + Math.random() * 100,
          queries: queryBase - 5 + Math.random() * 15
        }));
      }
    }, 5000);

    res.json(newTest);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
