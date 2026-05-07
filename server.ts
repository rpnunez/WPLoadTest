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

  // In-memory store simulating MySQL custom tables for this demo
  const testResults: any[] = [
    {
      id: "st-001",
      pluginName: "WooCommerce",
      status: "completed",
      startTime: Date.now() - 3600000,
      endTime: Date.now() - 1800000,
      loadConfig: { users: 50, duration: 30, pattern: "ramp-up" },
      metrics: {
        avgCpu: 42,
        peakMemory: 512,
        avgQueryTime: 12,
        latency: 185
      },
      timeseries: Array.from({ length: 20 }, (_, i) => ({
        time: i * 5,
        cpu: 20 + Math.random() * 40,
        memory: 128 + Math.random() * 256,
        queries: 5 + Math.random() * 10
      }))
    }
  ];

  // API Routes
  app.get("/api/tests", (req, res) => {
    res.json(testResults);
  });

  app.get("/api/tests/:id", (req, res) => {
    const test = testResults.find(t => t.id === req.params.id);
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  });

  app.post("/api/tests/start", (req, res) => {
    const { pluginName, users, duration, pattern } = req.body;
    const newTest = {
      id: `st-${Math.random().toString(36).substr(2, 5)}`,
      pluginName,
      status: "running",
      startTime: Date.now(),
      loadConfig: { users, duration, pattern },
      metrics: { avgCpu: 0, peakMemory: 0, avgQueryTime: 0, latency: 0 },
      timeseries: []
    };
    testResults.unshift(newTest);
    
    // Simulate test completion after a delay
    setTimeout(() => {
      const test = testResults.find(t => t.id === newTest.id);
      if (test) {
        test.status = "completed";
        test.endTime = Date.now();
        test.metrics = {
          avgCpu: 30 + Math.random() * 50,
          peakMemory: 256 + Math.random() * 512,
          avgQueryTime: 5 + Math.random() * 20,
          latency: 100 + Math.random() * 400
        };
        test.timeseries = Array.from({ length: 20 }, (_, i) => ({
          time: i * 5,
          cpu: 20 + Math.random() * 60,
          memory: 200 + Math.random() * 300,
          queries: 10 + Math.random() * 30
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
