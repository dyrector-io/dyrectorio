import { toNumber } from './utils'

describe('toNumber() tests', () => {
  beforeEach(() => {})

  it('given string return null value', () => {
    const result = toNumber('test-string')
    expect(result).toEqual(null)
  })

  it('given negative int return negative value', () => {
    const result = toNumber('-1')

    expect(result).toEqual(-1)
  })

  it('given zero return zero', () => {
    const result = toNumber('0')

    expect(result).toEqual(0)
  })

  it('given positive int return positive int', () => {
    const result = toNumber('1848')

    expect(result).toEqual(1848)
  })

  it('given empty input return null', () => {
    const result = toNumber(undefined)

    expect(result).toEqual(null)
  })
})
