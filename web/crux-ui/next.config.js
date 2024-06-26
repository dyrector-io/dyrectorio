const dns = require('dns')

const resultOrder = process.env.DNS_DEFAULT_RESULT_ORDER

if (resultOrder) {
  dns.setDefaultResultOrder(resultOrder === 'ipv4first' ? 'ipv4first' : 'verbatim')
}

const nextTranslate = require('next-translate-plugin')

module.exports = {
  ...nextTranslate(),
  eslint: {
    dirs: ['src', 'e2e'],
  },
  output: 'standalone',
}
