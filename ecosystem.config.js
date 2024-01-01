module.exports = {
  apps: [
    {
      name: "production",
      script: "./dist/app.js",
      watch: ["src"],
      instances: -1,
      max_memory_restart: "1024",
      env: {
        Server_PORT: 5001,
        NODE_ENV: "production",
      },
    },
  ],
};
