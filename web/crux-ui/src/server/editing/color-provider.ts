type Color = {
  r: number
  g: number
  b: number
}

class ColorProvider {
  private colors: Map<string, string> = new Map()

  private inUse: Set<string> = new Set()

  generateOrGet(id: string): string {
    const idColor = this.colors.get(id)
    if (idColor) {
      return idColor
    }

    let baseMultiplier = 1.0
    let attempts = 0

    while (baseMultiplier > 0.2) {
      attempts += 1

      const baseColor: Color = {
        r: ColorProvider.BASE_COLOR.r * baseMultiplier,
        g: ColorProvider.BASE_COLOR.g * baseMultiplier,
        b: ColorProvider.BASE_COLOR.b * baseMultiplier,
      }
      const color = ColorProvider.randomColor(baseColor)
      const hexColor = ColorProvider.toHex(color)

      if (ColorProvider.saturationAndLightnessInRange(color) && !this.inUse.has(hexColor)) {
        this.inUse.add(hexColor)
        this.colors.set(id, hexColor)
        return hexColor
      }

      if (attempts >= ColorProvider.ATTEMPTS_PER_MULTIPLIER) {
        baseMultiplier -= 0.2
        attempts = 0
      }
    }

    return '#ffffff' // very unlikely, but failed to generate, so we use white
  }

  free(id: string): void {
    const color = this.colors.get(id)
    if (!color) {
      return
    }

    this.colors.delete(id)
    this.inUse.delete(color)
  }

  private static toHex(color: Color) {
    return `#${this.hexFromByte(color.r)}${this.hexFromByte(color.g)}${this.hexFromByte(color.b)}`
  }

  private static randomColor(baseColor: Color): Color {
    // mixing with the base color
    const r = (baseColor.r + this.randomByte()) / 2
    const g = (baseColor.g + this.randomByte()) / 2
    const b = (baseColor.b + this.randomByte()) / 2

    return {
      r,
      g,
      b,
    }
  }

  private static randomByte(): number {
    return Math.floor(Math.random() * 256) - 1
  }

  private static hexFromByte(component: number): string {
    const hex = Math.ceil(component).toString(16)
    return hex.length < 2 ? `0${hex}` : hex
  }

  private static saturationAndLightnessInRange(color: Color): boolean {
    let { r, g, b } = color
    r /= 255
    g /= 255
    b /= 255

    const cMin = Math.min(r, g, b)
    const cMax = Math.max(r, g, b)
    const delta = cMax - cMin

    let l = (cMax + cMin) / 2
    let s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

    s = +(s * 100).toFixed(1)
    l = +(l * 100).toFixed(1)

    return s >= this.SL_MIN && s <= this.SL_MAX && l >= this.SL_MIN && l <= this.SL_MAX
  }

  private static BASE_COLOR: Color = {
    // white
    r: 255,
    g: 255,
    b: 255,
  }

  private static ATTEMPTS_PER_MULTIPLIER = 256

  private static SL_MIN = 40 // percent

  private static SL_MAX = 80 // percent
}

export default ColorProvider
