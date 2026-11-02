import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function main() {
  try {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      console.log(`[Shrtn Server] Running on http://localhost:${env.PORT}`);
      console.log(`[Shrtn Server] Environment: ${env.NODE_ENV}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log("HTTP server closed.");
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10s if hanging
      setTimeout(() => {
        console.error("Forcefully shutting down after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error: any) {
    console.error("Failed to start server:", error.message || error);
    process.exit(1);
  }
}

main();
