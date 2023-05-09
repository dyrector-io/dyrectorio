const dns = require('dns')

const resultOrder = process.env.DNS_DEFAULT_RESULT_ORDER

if (resultOrder) {
  dns.setDefaultResultOrder(resultOrder === 'ipv4first' ? 'ipv4first' : 'verbatim')
} else if (process.env.NODE_ENV !== 'production') {
  dns.setDefaultResultOrder('ipv4first')
}
const nextTranslate = require('next-translate')

module.exports = {
  ...nextTranslate(),
  eslint: {
    dirs: ['src'],
  },
}
