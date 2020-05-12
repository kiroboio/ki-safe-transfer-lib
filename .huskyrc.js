const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': 'npm run lint',
    'pre-push': tasks(['npm run test:push', 'npm run build']),
  },
}
