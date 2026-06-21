module.exports = {
  apps: [
    {
      name: 'startup-coach',
      cwd: '/var/www/startup-coach',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
      },
    },
  ],
}
