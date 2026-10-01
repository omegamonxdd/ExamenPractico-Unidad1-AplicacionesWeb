import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Card, CardApiResponse, CardSearchParams } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private readonly http = inject(HttpClient);

  /** Base URL for the YGOPRODeck public API v7 */
  private readonly API_URL = 'https://db.ygoprodeck.com/api/v7';

  /**
   * Search cards with optional filters.
   * @param params - Optional search parameters (name, type, race, etc.)
   * @returns Observable of CardApiResponse containing matching cards.
   */
  searchCards(params: CardSearchParams = {}): Observable<CardApiResponse> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http
      .get<CardApiResponse>(`${this.API_URL}/cardinfo.php`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a single card by its exact name.
   */
  getCardByName(name: string): Observable<CardApiResponse> {
    return this.searchCards({ name });
  }

  /**
   * Get a single card by its ID.
   */
  getCardById(id: number): Observable<CardApiResponse> {
    return this.searchCards({ id });
  }

  /**
   * Fuzzy search cards by partial name.
   */
  searchByFuzzyName(fname: string): Observable<CardApiResponse> {
    return this.searchCards({ fname });
  }

  /**
   * Get a random card from the API.
   */
  getRandomCard(): Observable<Card> {
    return this.http
      .get<Card>(`${this.API_URL}/randomcard.php`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all available card archetypes.
   */
  getArchetypes(): Observable<{ archetype_name: string }[]> {
    return this.http
      .get<{ archetype_name: string }[]>(`${this.API_URL}/archetypes.php`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all card types (Monster, Spell, Trap, etc.).
   */
  getCardTypes(): Observable<{ name: string }[]> {
    return this.http
      .get<{ name: string }[]>(`${this.API_URL}/cardtypes.php`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all card sub-types / races (Warriors, Dragon, etc.).
   */
  getCardSubTypes(): Observable<{ name: string }[]> {
    return this.http
      .get<{ name: string }[]>(`${this.API_URL}/cardsubtypes.php`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all available card attributes (DARK, LIGHT, FIRE, etc.).
   */
  getCardAttributes(): Observable<{ name: string }[]> {
    return this.http
      .get<{ name: string }[]>(`${this.API_URL}/cardattributes.php`)
      .pipe(catchError(this.handleError));
  }

  /** Handles HTTP errors and returns a user-friendly Observable error. */
  private handleError(error: any): Observable<never> {
    let message = 'An unknown error occurred.';
    if (error.status === 400) {
      message = 'No cards found for the given search parameters.';
    } else if (error.status === 429) {
      message = 'Too many requests. Please slow down.';
    } else if (error.status >= 500) {
      message = 'YGOPRODeck API server error. Please try again later.';
    }
    console.error('[CardService]', error);
    return throwError(() => new Error(message));
  }
}
