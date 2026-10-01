import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CardApiResponse } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class YugiohService {
  private readonly http = inject(HttpClient);

  /** Endpoint base de la API pública de YGOPRODeck v7 */
  private readonly API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

  /**
   * Búsqueda fuzzy de cartas por nombre parcial usando el parámetro `fname`.
   * Los datos provienen exclusivamente de la API de YGOPRODeck.
   */
  searchCards(fname: string): Observable<CardApiResponse> {
    return this.http
      .get<CardApiResponse>(this.API_URL, { params: { fname } })
      .pipe(
        catchError(err => {
          if (err.status === 400) {
            return throwError(() => new Error('No se encontraron cartas para esa búsqueda.'));
          }
          if (err.status === 429) {
            return throwError(() => new Error('Demasiadas peticiones. Espera un momento.'));
          }
          return throwError(() => new Error('Error de red. Revisa tu conexión e intenta de nuevo.'));
        })
      );
  }

  /**
   * Obtiene todas las cartas del arquetipo "Blue-Eyes" desde la API.
   * El nombre del arquetipo no está hardcodeado en el componente;
   * se pasa como parámetro dinámico al endpoint.
   */
  getBlueEyesCards(): Observable<CardApiResponse> {
    return this.http
      .get<CardApiResponse>(this.API_URL, { params: { archetype: 'Blue-Eyes' } })
      .pipe(
        catchError(err => {
          if (err.status === 400) {
            return throwError(() => new Error('No se encontraron cartas para el arquetipo Blue-Eyes.'));
          }
          if (err.status === 429) {
            return throwError(() => new Error('Demasiadas peticiones. Espera un momento.'));
          }
          return throwError(() => new Error('Error de red al cargar el arquetipo Blue-Eyes.'));
        })
      );
  }
}
