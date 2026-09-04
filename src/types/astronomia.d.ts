// astronomia 类型声明（库无自带 d.ts——宽松声明用到的 API）
declare module 'astronomia' {
  export const julian: {
    DateToJDE(d: Date): number
  }
  export const solar: {
    apparentLongitude(T: number): number
  }
  export const sidereal: {
    apparent(jde: number): number
  }
  export const nutation: {
    meanObliquity(jde: number): number
  }
  export const coord: {
    Equatorial: new (ra: number, dec: number) => {
      ra: number
      dec: number
      toEcliptic(eps: number): { lon: number; lat: number }
    }
    Ecliptic: new (lon: number, lat: number) => { lon: number; lat: number }
  }
  export const moonposition: {
    position(jde: number): { ra: number; dec: number }
  }
  export const planetposition: {
    Planet: new (data: unknown) => {
      position(jde: number): { lon: number; lat: number; range: number }
    }
  }
  export const pluto: {
    astrometric(jde: number, earth: unknown): { ra: number; dec: number }
  }
}

// VSOP87 数据子模块（无类型——宽松 any）
declare module 'astronomia/data/*' {
  const data: { default?: unknown; L?: unknown; B?: unknown; R?: unknown }
  export default data
}
