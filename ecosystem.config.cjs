// PM2 process config for Homesite-v2.
// Usage:  pm2 start ecosystem.config.cjs
//         pm2 restart homesite
//         pm2 logs homesite
module.exports = {
  apps: [
    {
      name: 'homesite',
      script: 'node_modules/.bin/next',
      args: 'dev',
      cwd: '/Users/dahub/Projects/Homesite-v2',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
  ],
}
