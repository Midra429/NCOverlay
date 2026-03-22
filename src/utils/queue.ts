export class Queue<T> {
  #maxSize: number
  #stackPush: T[] = []
  #stackPop: T[] = []

  constructor(maxSize: number) {
    this.#maxSize = maxSize
  }

  enqueue(value: T) {
    if (this.#maxSize <= this.#stackPush.length) {
      this.#stackPush.shift()
    }

    this.#stackPush.push(value)
  }

  dequeue(): T | undefined {
    if (this.#stackPop.length === 0) {
      while (0 < this.#stackPush.length) {
        this.#stackPop.push(this.#stackPush.pop()!)
      }
    }

    return this.#stackPop.pop()
  }

  clear() {
    this.#stackPush = []
    this.#stackPop = []
  }

  find(predicate: (value: T) => boolean): T | undefined {
    return this.#stackPop.find(predicate) ?? this.#stackPush.find(predicate)
  }
}
