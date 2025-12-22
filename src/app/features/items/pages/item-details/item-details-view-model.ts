import { DestroyRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ItemApiService } from '../../../../core/services/item-api.service';
import { ItemsHistoryService } from '../../../../core/services/items-history';
import { TrackedItemsService } from '../../../../core/services/items-tracked';
import { ItemDetails, ItemPreview } from '../../models/item';

type GameMode = 'pve' | 'regular';
type Status = 'idle' | 'loading' | 'ready' | 'error';

export type DetailsUiState = {
  id: string | null;
  mode: GameMode;

  status: Status;
  item?: ItemDetails;
  tracked: boolean;
  errorMessage?: string;
};

const initialState: DetailsUiState = {
  id: null,
  mode: 'pve',

  status: 'idle',
  item: undefined,
  tracked: false,
  errorMessage: undefined,
};

@Injectable({ providedIn: 'root' })
export class ItemDetailsViewModel {
  private api = inject(ItemApiService);
  private history = inject(ItemsHistoryService);
  private trackedService = inject(TrackedItemsService);
  private destroyRef = inject(DestroyRef);

  private stateSubject = new BehaviorSubject<DetailsUiState>(initialState);

  state$ = this.stateSubject.asObservable();

  get snapshot(): DetailsUiState {
    return this.stateSubject.value;
  }

  constructor() {
    this.state$.pipe(
      map(s => ({ id: s.id, mode: s.mode })),
      // если быстро кликаешь по разным товарам (или меняешь режим) — защитимся от дребезга
      debounceTime(0),
      distinctUntilChanged((a, b) => a.id === b.id && a.mode === b.mode),

      switchMap(({ id, mode }) => {
        if (!id) {
          return of<DetailsUiState>({
            ...this.snapshot,
            status: 'idle',
            item: undefined,
            tracked: false,
            errorMessage: undefined,
          });
        }

        return this.api.getItemById({ id, lang: 'en', gamemode: mode }).pipe(
          map(item => {
            // 1) пишем в историю
            const preview: ItemPreview = { id: item.id, name: item.name, iconLink: item.iconLink };
            this.history.add(preview);

            // 2) проверяем tracked
            const isTracked = this.trackedService.isTracked(item.id);

            return {
              ...this.snapshot,
              id,
              mode,
              status: 'ready',
              item,
              tracked: isTracked,
              errorMessage: undefined,
            } satisfies DetailsUiState;
          }),
          startWith({
            ...this.snapshot,
            id,
            mode,
            status: 'loading',
            item: undefined,
            tracked: false,
            errorMessage: undefined,
          } satisfies DetailsUiState),
          catchError(err =>
            of({
              ...this.snapshot,
              id,
              mode,
              status: 'error',
              item: undefined,
              tracked: false,
              errorMessage: String(err?.message ?? err),
            } satisfies DetailsUiState),
          ),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(next => this.stateSubject.next(next));
  }

  load(id: string) {
    // если тот же id — не триггерим лишний раз
    if (this.snapshot.id === id) return;
    this.patch({ id });
  }

  setMode(mode: GameMode) {
    if (this.snapshot.mode === mode) return;
    this.patch({ mode });
  }

  toggleTracked() {
    const s = this.snapshot;
    if (s.status !== 'ready' || !s.item) return;

    const preview: ItemPreview = { id: s.item.id, name: s.item.name, iconLink: s.item.iconLink };
    this.trackedService.toggle(preview);

    this.patch({ tracked: this.trackedService.isTracked(preview.id) });
  }

  private patch(patch: Partial<DetailsUiState>) {
    this.stateSubject.next({ ...this.snapshot, ...patch });
  }
}
