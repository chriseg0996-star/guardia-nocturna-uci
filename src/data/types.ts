export type Card = {
  q: string
  a: string
  options?: string[]
  correct?: number
}

export type EventCard = {
  ico: string
  t: string
  x: string
  life?: number
}

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type Category = {
  id: CategoryId
  name: string
  shortName: string
  color: string
  icon: string
  pending?: boolean
}
