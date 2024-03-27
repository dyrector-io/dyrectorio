type Link<T> = {
  item: T
  next: Link<T>
}

class FixedLengthLinkedListIterator<T> implements Iterator<T> {
  constructor(private link: Link<T>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next(): IteratorResult<T, T> {
    const result = {
      done: !this.link,
      value: this.link?.item,
    }

    this.link = this.link?.next

    return result
  }
}

export default class FixedLengthLinkedList<T> implements Iterable<T> {
  private first: Link<T> = null

  private last: Link<T> = null

  private length: number = 0

  constructor(private maxSize: number) {
    if (maxSize < 0) {
      throw new Error('Invalid size')
    }
  }

  push(item: T) {
    const link = {
      item,
      next: null,
    }

    if (!this.first) {
      this.first = link
      this.last = link
    } else {
      this.last.next = link
      this.last = link

      if (this.length >= this.maxSize) {
        this.first = this.first.next
        return
      }
    }

    this.length++
  }

  [Symbol.iterator](): Iterator<T, T, T> {
    return new FixedLengthLinkedListIterator(this.first)
  }
}
