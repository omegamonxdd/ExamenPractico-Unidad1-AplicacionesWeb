import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, EMPTY } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
  catchError,
} from 'rxjs/operators';
import { YugiohService } from '../../services/yugioh.service';
import { Card } from '../../models/card.model';

/** Estados posibles de la interfaz de búsqueda */
type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

@Component({
  selector: 'app-card-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './card-search.component.html',
  styleUrl: './card-search.component.scss',
})
export class CardSearchComponent implements OnInit, OnDestroy {
  private readonly yugiohService = inject(YugiohService);

  // ── Señales de estado ────────────────────────────────────────
  readonly status = signal<SearchStatus>('idle');
  readonly cards = signal<Card[]>([]);
  readonly errorMessage = signal('');

  /** Valor enlazado al input de búsqueda (two-way binding) */
  searchQuery = '';

  // ── Pipeline reactivo ────────────────────────────────────────
  private readonly search$ = new Subject<string>();
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.search$
      .pipe(
        debounceTime(400),           // espera 400ms tras la última tecla
        distinctUntilChanged(),      // ignora si el término no cambió
        tap(term => {
          if (!term.trim()) {
            // Campo vacío → volver al estado inicial
            this.status.set('idle');
            this.cards.set([]);
          } else {
            this.status.set('loading');
          }
        }),
        filter(term => !!term.trim()), // no hace petición con cadena vacía
        switchMap(term =>
          this.yugiohService.searchCards(term).pipe(
            catchError(err => {
              this.errorMessage.set(err.message);
              this.status.set('error');
              return EMPTY; // completa sin emitir para no entrar en subscribe
            })
          )
        )
      )
      .subscribe(response => {
        const data = response.data ?? [];
        this.cards.set(data);
        this.status.set(data.length > 0 ? 'success' : 'empty');
      });
  }

  /** Emite el término al Subject cada vez que el input cambia */
  onSearch(term: string): void {
    this.search$.next(term);
  }

  /** Función de tracking para @for, evita re-renderizar cartas iguales */
  trackById(_: number, card: Card): number {
    return card.id;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
