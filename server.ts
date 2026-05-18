import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // In-memory state (Simulating a database for LAN)
  let classroom = {
    name: "CS 101: Tizim nazorati",
    globalBlockedApps: ["Steam", "Roblox", "Discord"],
    broadcastMessage: "Tizim faol. Ko'rsatmalar kutilmoqda.",
    activeSession: true,
    autoBlockGames: false
  };

  const GAME_KEYWORDS = ["steam", "roblox", "minecraft", "csgo", "valorant", "league", "fortnite", "genshin", "epic games", "riot"];

  let students = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Identity handling
    socket.on("identify", (data) => {
      if (data.role === "student") {
        students.set(socket.id, {
          uid: socket.id,
          name: data.name || `Station-${socket.id.slice(0, 4)}`,
          status: "online",
          currentApp: "Desktop",
          isBlocked: false,
          screenData: null,
          systemSpecs: { os: "Windows 11", ram: "16GB", cpu: "i7-12700K" },
          ...data
        });
        io.emit("students_updated", Array.from(students.values()));
      }
      socket.emit("classroom_state", classroom);
    });

    socket.on("update_student_status", (data) => {
      if (students.has(socket.id)) {
        const student = students.get(socket.id);
        
        // Blocking enforcement
        let finalData = { ...data };
        if (data.currentApp) {
          const isBlockedGlobally = classroom.globalBlockedApps.includes(data.currentApp);
          const appLower = data.currentApp.toLowerCase();
          const isAutoGame = classroom.autoBlockGames && GAME_KEYWORDS.some(kw => appLower.includes(kw));

          if (isBlockedGlobally || isAutoGame) {
            if (isAutoGame && !isBlockedGlobally) {
              classroom.globalBlockedApps = [...classroom.globalBlockedApps, data.currentApp];
              io.emit("classroom_state", classroom);
            }
            // Enforce killing the process on the client
            socket.emit("student_command", { type: 'kill_process', process_name: data.currentApp });
          }
        }

        students.set(socket.id, { ...student, ...finalData });
        io.emit("students_updated", Array.from(students.values()));
      }
    });

    // Teacher commands
    socket.on("teacher_command", (data) => {
      // Broadcast to all or specific student
      if (data.target === "all") {
        if (data.command.type === "toggle_auto_block") {
          classroom.autoBlockGames = data.command.value;
          io.emit("classroom_state", classroom);
          return;
        }

        io.emit("student_command", data.command);
        
        // Update classroom state if it's a global setting
        if (data.command.type === "block_global") {
          classroom.globalBlockedApps = data.command.apps;
          io.emit("classroom_state", classroom);
        }
        if (data.command.type === "broadcast") {
          classroom.broadcastMessage = data.command.message;
          io.emit("classroom_state", classroom);
        }
      } else {
        io.to(data.target).emit("student_command", data.command);
        
        // Update local student state
        const student = students.get(data.target);
        if (student) {
          if (data.command.type === "lock") {
            student.isBlocked = data.command.value;
            students.set(data.target, student);
            io.emit("students_updated", Array.from(students.values()));
          }
        }
      }
    });

    socket.on("seed_students", () => {
      const mockNames = ["Alpha-Station", "Beta-Node", "Gamma-Labs", "Delta-Proxy", "Epsilon-Host", "Zeta-Terminal", "Theta-Worker"];
      const apps = ["Chrome", "VS Code", "Spotify", "Desktop", "Roblox", "Steam", "IntelliJ IDEA", "Discord", "Minecraft", "Figma"];
      
      mockNames.forEach((name, i) => {
        const id = `mock-${i}`;
        students.set(id, {
          uid: id,
          name: name,
          status: "online",
          currentApp: apps[Math.floor(Math.random() * apps.length)],
          isBlocked: false,
          systemSpecs: { os: "Windows 11", ram: i % 2 === 0 ? "16GB" : "32GB", cpu: i % 2 === 0 ? "i7-12700K" : "Ryzen 9 5900X" }
        });
      });
      io.emit("students_updated", Array.from(students.values()));
    });

    socket.on("disconnect", () => {
      if (students.has(socket.id)) {
        students.delete(socket.id);
        io.emit("students_updated", Array.from(students.values()));
      }
      console.log("User disconnected");
    });
  });

  // API routes
  app.get("/api/status", (req, res) => {
    res.json({ status: "running", nodes: students.size });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname); 
    // Since server.cjs is IN the dist folder during build (or next to it)
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`LAN Control Server running on http://localhost:${PORT}`);
  });
}

startServer();
