export type Shape =
  | 'tube' | 'pump' | 'spray' | 'bottle' | 'pouch' | 'box'
  | 'jar' | 'stick' | 'tin' | 'pack' | 'soap' | 'refill' | 'bag'

export interface Look {
  shape: Shape
  body: string      // główny kolor opakowania
  accent: string    // zakrętka / pasek / wieczko
  ink: string       // kolor napisów
  brand?: string    // mały napis u góry (często po łacinie)
  big: string       // duży napis na froncie
  vert?: boolean    // duży napis pionowo (po japońsku)
  sub?: string      // mały napis pod spodem
  badge?: string    // okrągła naklejka
  stripe?: string   // opcjonalny pasek dekoracyjny
}

export interface Product {
  id: string
  look: Look
  /** linie etykiety; słówka ze słownika w [nawiasach] */
  label: string[]
  /** co pokaże tłumacz w telefonie */
  tl: string
  price: number
  /** wyjaśnienie, gdy kupisz to zamiast czegoś z listy */
  why?: string
}

export interface Target {
  id: string
  /** tak jak Asia zapisała na liście */
  note: string
  photo: string
  accepts: string[]
  /** po znalezieniu – co to właściwie było */
  reveal: string
}

export interface Aisle {
  /** napis nad alejką – po japońsku, słówka w [nawiasach] */
  sign: string
  shelves: string[][]
}

export interface Level {
  id: string
  station: string       // kanji na tabliczce stacji
  romaji: string
  city: string
  store: string
  storeJp: string
  theme: 'matsukiyo' | 'donki' | 'kyoto'
  intro: string[]
  greeting: string
  budget: number
  battery: number
  /** godzina otwarcia gry i zamknięcia sklepu (minuty od północy) */
  clockStart: number
  clockEnd: number
  /** ile prawdziwych sekund trwa poziom */
  seconds: number
  hints: number
  targets: Target[]
  products: Product[]
  aisles: Aisle[]
}
