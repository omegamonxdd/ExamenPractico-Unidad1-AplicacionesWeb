// YGOPRODeck API v7 - Card Models

export interface CardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface CardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

export interface Card {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  race: string;
  archetype?: string;
  // Monster-specific
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  // Link/Pendulum-specific
  linkval?: number;
  linkmarkers?: string[];
  scale?: number;
  // Sets & images
  card_sets?: CardSet[];
  card_images: CardImage[];
  card_prices?: CardPrice[];
}

export interface CardApiResponse {
  data: Card[];
  meta?: {
    current_rows: number;
    total_rows: number;
    rows_remaining: number;
    total_pages: number;
    current_page: number;
  };
}

export interface CardSearchParams {
  name?: string;
  fname?: string;       // fuzzy name search
  id?: number;
  type?: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  num?: number;         // number of results (pagination)
  offset?: number;      // pagination offset
  sort?: 'name' | 'atk' | 'def' | 'type' | 'level' | 'id' | 'new';
  format?: 'tcg' | 'goat' | 'ocg goat' | 'speed duel' | 'master duel' | 'rush duel' | 'duel links';
  staple?: 'yes';
  has_effect?: 0 | 1;
}
