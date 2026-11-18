import type { Book } from '../types'
import { donQuixote } from './donQuixote'

export const books: Book[] = [donQuixote]

export const findBook = (slug: string | undefined) => books.find((b) => b.slug === slug)
