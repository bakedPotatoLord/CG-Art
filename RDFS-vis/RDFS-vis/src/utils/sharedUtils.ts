

export type vec2 = [number, number]
export type vec4 = [number, number, number, number]

export function clamp(val: number, min: number, max: number) {
  return (val > max) ? max : (val < min) ? min : val
}
export function mutate(num: number, rand: number, min = -Infinity, max = Infinity) {
  return clamp(num + Math.floor((Math.random() - 0.5) * rand * 2), min, max)
}



export function vectorAvg(vec: vec4[]) {
  return <vec4>vec.slice(1)
    .reduce(([a1, a2, a3, a4], [b1, b2, b3, b4]) => [a1 + b1, a2 + b2, a3 + b3, a4 + b4], vec[0])
    .map(val => val / vec.length)
}
export function shuffle(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5)
}