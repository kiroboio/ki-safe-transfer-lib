const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': 'npm run lint',
    'pre-push': 'npm run test:push',
  },
}