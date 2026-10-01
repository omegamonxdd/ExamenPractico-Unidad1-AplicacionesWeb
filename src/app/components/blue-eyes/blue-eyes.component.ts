import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { YugiohService } from '../../services/yugioh.service';
import { Card } from '../../models/card.model';

// ── Modelo de una impresión (carta + set) ──────────────────────────────────
export interface CardPrint {
  cardId:          number;
  cardName:        string;
  cardType:        string;
  imageUrl:        string;
  imageUrlSmall:   string;
  setName:         string;
  setCode:         string;
  setRarity:       string;
  /** Precio de esa impresión específica según la API (card_sets[].set_price) */
  setPrice:        string;
  /** Precio de referencia en Cardmarket (card_prices[0].cardmarket_price) */
  cardmarketPrice: string;
  /** Precio de referencia en TCGPlayer (card_prices[0].tcgplayer_price) */
  tcgplayerPrice:  string;
}

type LoadStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-blue-eyes',
  standalone: true,
  imports: [],
  templateUrl: './blue-eyes.component.html',
  styleUrl: './blue-eyes.component.scss',
})
export class BlueEyesComponent implements OnInit, OnDestroy {
  private readonly yugiohService = inject(YugiohService);

  // ── Estado de carga ──────────────────────────────────────────────────────
  readonly status       = signal<LoadStatus>('loading');
  readonly errorMessage = signal('');

  // ── Datos procesados desde la API ────────────────────────────────────────
  /** Lista aplanada de todas las impresiones (una por cada card_sets entry) */
  private readonly allPrints  = signal<CardPrint[]>([]);

  /** Expansiones únicas generadas automáticamente (sin duplicados, ordenadas) */
  readonly expansions         = signal<string[]>([]);

  // ── Filtrado dinámico ────────────────────────────────────────────────────
  /** Expansión actualmente seleccionada; null = sin filtro */
  readonly selectedExpansion  = signal<string | null>(null);

  /** Impresiones filtradas — recalculadas automáticamente con computed() */
  readonly filteredPrints = computed<CardPrint[]>(() => {
    const selected = this.selectedExpansion();
    const prints   = this.allPrints();
    return selected ? prints.filter(p => p.setName === selected) : prints;
  });

  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.yugiohService.getBlueEyesCards().subscribe({
      next: response => {
        const prints = this.flattenPrints(response.data ?? []);
        this.allPrints.set(prints);
        this.expansions.set(this.extractExpansions(prints));
        this.status.set('success');
      },
      error: err => {
        this.errorMessage.set(err.message);
        this.status.set('error');
      },
    });
  }

  // ── Procesamiento de datos ───────────────────────────────────────────────

  /**
   * Aplana el array de cartas: por cada carta y cada entrada en card_sets
   * crea un objeto CardPrint independiente.
   * No se hardcodea ningún nombre de carta ni de expansión.
   */
  private flattenPrints(cards: Card[]): CardPrint[] {
    const prints: CardPrint[] = [];
    for (const card of cards) {
      if (!card.card_sets?.length) continue;
      for (const cs of card.card_sets) {
        prints.push({
          cardId:          card.id,
          cardName:        card.name,
          cardType:        card.type,
          imageUrl:        card.card_images[0]?.image_url        ?? '',
          imageUrlSmall:   card.card_images[0]?.image_url_small  ?? '',
          setName:         cs.set_name,
          setCode:         cs.set_code,
          setRarity:       cs.set_rarity,
          setPrice:        cs.set_price,
          cardmarketPrice: card.card_prices?.[0]?.cardmarket_price ?? '—',
          tcgplayerPrice:  card.card_prices?.[0]?.tcgplayer_price  ?? '—',
        });
      }
    }
    return prints;
  }

  /**
   * Extrae expansiones únicas y ordenadas alfabéticamente a partir
   * de las impresiones aplanadas — sin duplicados y sin hardcodear nada.
   */
  private extractExpansions(prints: CardPrint[]): string[] {
    const seen = new Set<string>();
    for (const p of prints) seen.add(p.setName);
    return [...seen].sort((a, b) => a.localeCompare(b));
  }

  // ── Acciones de UI ───────────────────────────────────────────────────────

  /** Selecciona o des-selecciona una expansión como filtro activo */
  selectExpansion(name: string): void {
    this.selectedExpansion.set(
      this.selectedExpansion() === name ? null : name
    );
  }

  /** Elimina el filtro activo y muestra todas las impresiones */
  clearFilter(): void {
    this.selectedExpansion.set(null);
  }

  /** Clave de tracking: cardId + setCode garantiza unicidad por impresión */
  trackPrint(_: number, print: CardPrint): string {
    return `${print.cardId}-${print.setCode}`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
