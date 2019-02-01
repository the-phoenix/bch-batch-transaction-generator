export function generateRandom(lowBound: number, highBound: number): number {
  return Math.floor(Math.random() * highBound) + lowBound 
}