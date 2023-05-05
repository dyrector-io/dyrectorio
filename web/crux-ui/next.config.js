if (process.env.NODE_ENV !== 'production') {
  const dns = require('dns')
  dns.setDefaultResultOrder('ipv4first')
}

const nextTranslate = require('next-translate')

module.exports = {
  ...nextTranslate(),
  eslint: {
    dirs: ['src'],
  },
}
