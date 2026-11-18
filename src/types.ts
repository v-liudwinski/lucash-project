export type EpisodeKind =
  | 'adventure'
  | 'love'
  | 'story'
  | 'enchant'
  | 'home'
  | 'meeting'
  | 'meta'

export interface Place {
  id: string
  name: string
  lat: number
  lng: number
  /** Автор не вказує точного місця — локація умовна або за традицією */
  approximate?: boolean
  /** Показувати підпис на мапі постійно */
  major?: boolean
  /** Підпис видно навіть на дальньому зумі */
  always?: boolean
  /** Масштаб, до якого наближати мапу */
  zoom?: number
  note?: string
}

export interface Journey {
  id: number
  title: string
  subtitle: string
  color: string
}

export interface Part {
  id: number
  title: string
  year: number
}

export interface Episode {
  id: string
  part: number
  journey: number
  chapters: string
  title: string
  kind: EpisodeKind
  place: string
  summary: string
  highlights?: string[]
  characters: string[]
}

export interface Character {
  id: string
  name: string
  role: string
  description: string
}

export interface Book {
  slug: string
  title: string
  shortTitle: string
  author: string
  authorYears: string
  translators: string
  originalYears: string
  tagline: string
  description: string
  cover: {
    leather: string
    accent: string
    emblem: 'windmill'
    subtitle: string
  }
  mapTitle: string
  parts: Part[]
  journeys: Journey[]
  places: Place[]
  characters: Character[]
  episodes: Episode[]
  chapterCount: number
}
