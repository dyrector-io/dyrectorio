import FixedLengthLinkedList from './fixed-length-linked-list'

describe('FixedLengthLinkedList', () => {
  it('items can be pushed', () => {
    const list = new FixedLengthLinkedList<string>(10)

    expect(() => list.push('first')).not.toThrow()
  })

  it('items can be beyond the defined length', () => {
    const list = new FixedLengthLinkedList<string>(10)

    expect(() => Array.from({ length: 25 }).forEach(() => list.push('item'))).not.toThrow()
  })

  it('iterable without an item', () => {
    const list = new FixedLengthLinkedList<string>(10)

    expect(() => {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of list) {
        item.toString()
      }
    }).not.toThrow()
  })

  it('iterable with some item', () => {
    const list = new FixedLengthLinkedList<string>(10)

    list.push('first')
    list.push('second')

    const expected = ['first', 'second']

    const actual = []
    // eslint-disable-next-line no-restricted-syntax
    for (const item of list) {
      actual.push(item)
    }

    expect(actual).toEqual(expected)
  })

  it('iterable with size byond the length', () => {
    const list = new FixedLengthLinkedList<string>(10)

    Array.from({ length: 25 }).forEach(() => list.push('item'))

    expect(() => {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of list) {
        item.toString()
      }
    }).not.toThrow()
  })

  it('can be converted to an array', () => {
    const list = new FixedLengthLinkedList<string>(5)

    let index = 0
    Array.from({ length: 8 }).forEach(() => {
      list.push(`item-${index}`)
      index++
    })

    const expected = ['item-3', 'item-4', 'item-5', 'item-6', 'item-7']

    const actual = Array.from(list)

    expect(actual).toEqual(expected)
  })
})
