export class LRUQueue<V> {
  #limit: number
  #map: Map<string, V>

  constructor(limit: number) {
    this.#limit = limit
    this.#map = new Map()
  }

  clear() {
    this.#map.clear()
  }

  add(key: string, value: V) {
    this.#map.delete(key)
    this.#map.set(key, value)

    if (this.#limit < this.#map.size) {
      const oldKey = this.#map.keys().next().value!

      this.#map.delete(oldKey)
    }
  }

  remove(key: string): boolean {
    return this.#map.delete(key)
  }

  has(key: string): boolean {
    return this.#map.has(key)
  }

  hit(key: string): boolean {
    if (!this.#map.has(key)) {
      return false
    }

    const value = this.#map.get(key)!

    this.#map.delete(key)
    this.#map.set(key, value)

    return true
  }

  get(key: string): V | undefined {
    if (!this.#map.has(key)) return

    const value = this.#map.get(key)!

    this.#map.delete(key)
    this.#map.set(key, value)

    return value
  }

  find(
    predicate: (value: V, index: number) => unknown
  ): [string, V] | undefined {
    return this.#map.entries().find(([_, v], i) => predicate(v, i))
  }

  toObject(): Record<string, V> {
    return Object.fromEntries(this.#map.entries())
  }
}
