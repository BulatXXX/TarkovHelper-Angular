import {DestroyRef, inject, Injectable} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

import {ItemApiService} from '../../../../core/services/item-api.service';
import {ItemPreview} from '../../../../core/models/item';
import {ItemsHistoryService} from '../../../../core/services/items-history';

type GameMode = 'pve' | 'regular';

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export type SearchUiState = {
  query: string;
  mode: GameMode;
  showHistory: boolean;

  status: SearchStatus;
  items: ItemPreview[];
  errorMessage?: string;
};

const initialState: SearchUiState = {
  query: '',
  mode: 'pve',
  showHistory: false,

  status: 'idle',
  items: [],
  errorMessage: undefined,
};

@Injectable({ providedIn: 'root' })
export class ItemSearchViewModel {
  private api = inject(ItemApiService);
  private history = inject(ItemsHistoryService);
  private destroyRef = inject(DestroyRef);

  private stateSubject = new BehaviorSubject<SearchUiState>(initialState);

  state$ = this.stateSubject.asObservable();
  history$ = this.history.history$;

  get getState(): SearchUiState {
    return this.stateSubject.value;
  }

  constructor() {
    this.state$.pipe(
      map(s => ({ q: s.query.trim(), mode: s.mode })),
      debounceTime(300),
      distinctUntilChanged((a, b) => a.q === b.q && a.mode === b.mode),
      switchMap(({ q, mode }) => {
        if (q.length < 2) {
          return of<SearchUiState>({
            ...this.getState,
            status: 'idle',
            items: [],
            errorMessage: undefined,
          });
        }

        return this.api.searchItems({ name: q, lang: 'en', gamemode: mode }).pipe(
          map(items => ({
            ...this.getState,
            status: 'ready',
            items,
            errorMessage: undefined,
          }) satisfies SearchUiState),
          startWith({
            ...this.getState,
            status: 'loading',
            items: [],
            errorMessage: undefined,
          } satisfies SearchUiState),
          catchError(err =>
            of({
              ...this.getState,
              status: 'error',
              items: [],
              errorMessage: String(err?.message ?? err),
            } satisfies SearchUiState),
          ),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(next => {
      this.stateSubject.next(next);
    });
  }

  setQuery(query: string) {
    this.patch({ query });
  }

  setMode(mode: GameMode) {
    this.patch({ mode });
  }

  setShowHistory(show: boolean) {
    this.patch({ showHistory: show });
  }

  private patch(patch: Partial<SearchUiState>) {
    this.stateSubject.next({ ...this.getState, ...patch });
  }

  clearHistory() {
    this.history.clear();
  }
}
