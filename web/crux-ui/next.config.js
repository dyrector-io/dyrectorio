const nextTranslate = require('next-translate')

module.exports = {
  ...nextTranslate(),
  eslint: {
    dirs: ['src'],
  },
}