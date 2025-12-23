import {inject, Injectable} from '@angular/core';
import {combineLatest, of} from 'rxjs';
import {catchError, distinctUntilChanged, map, shareReplay, startWith, switchMap} from 'rxjs/operators';

import {TrackedItemsService} from '../../../../core/services/items-tracked';
import {ItemApiService} from '../../../../core/services/item-api.service';
import {SettingsService} from '../../../../core/services/settings-service';
import {TrackedItem} from '../../../../core/models/item';

type ProfileRowState = TrackedItem & {
  status: 'loading' | 'ready' | 'error';
  name?: string;
  avg24hPrice?: number | null;
  error?: string;
};

export type Mode = 'pvp' | 'pve';

@Injectable()
export class ProfileViewModel {
  private tracked = inject(TrackedItemsService);
  private api = inject(ItemApiService);
  private settings = inject(SettingsService);

  readonly mode$ = this.settings.settings$.pipe(
    map(s => ((s.mode as Mode) ?? 'pvp')),
    distinctUntilChanged(),
  );

  private readonly lang: 'en' | 'ru' = 'en';

  readonly rows$ = combineLatest([this.tracked.tracked$, this.mode$]).pipe(
    switchMap(([tracked, mode]) => {
      if (!tracked.length) return of([] as ProfileRowState[]);

      const gamemode = mode === 'pve' ? 'pve' : 'regular';
      const ids = tracked.map(t => t.id);

      const loadingRows: ProfileRowState[] = tracked
        .map(t => ({ ...t, status: 'loading' as const }))
        .sort((a, b) => b.updatedAt - a.updatedAt);

      return this.api.getItemsByIdsForProfile({ ids, lang: this.lang, gamemode }).pipe(
        map(items => {
          const byId = new Map(items.map(i => [i.id, i]));

          const rows: ProfileRowState[] = tracked.map(t => {
            const it = byId.get(t.id);

            if (!it) {
              return {
                ...t,
                status: 'error' as const,
                name: '—',
                avg24hPrice: null,
                error: 'Item not found',
              };
            }

            return {
              ...t,
              status: 'ready' as const,
              name: it.name,
              avg24hPrice: it.avg24hPrice,
              // iconLink в локалке может быть null — тогда подхватим из API
              iconLink: t.iconLink ?? it.iconLink ?? null,
            };
          });

          return rows.sort((a, b) => b.updatedAt - a.updatedAt);
        }),
        catchError(err => {
          const msg = String(err?.message ?? err);
          const rows: ProfileRowState[] = tracked.map(t => ({
            ...t,
            status: 'error' as const,
            name: '—',
            avg24hPrice: null,
            error: msg,
          }));
          return of(rows.sort((a, b) => b.updatedAt - a.updatedAt));
        }),
        startWith(loadingRows),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
