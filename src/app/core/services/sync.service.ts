import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, switchMap, tap, throwError} from 'rxjs';

import {API_BASE_URL} from '../api/api.config';

import {AuthService} from '../auth/auth.service';
import {TrackedItem} from '../models/item';
import {TrackedItemsService} from './items-tracked';
import {Mode} from '../../features/profile/pages/profile/profile-view-model';


export type SyncStrategy = 'localToServer' | 'serverToLocal' | 'merge';

type GetTrackedResp = { items: TrackedItem[] };
type PutTrackedReq = { items: TrackedItem[] };
type PutTrackedResp = { items: TrackedItem[] };

@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private local = inject(TrackedItemsService);

  sync(mode: Mode, strategy: SyncStrategy): Observable<TrackedItem[]> {
    // гость — синка нет
    if (!this.auth.isAuthed) {
      return of(this.local.snapshot());
    }

    return this.getServer(mode).pipe(
      switchMap(serverItems => {
        const localItems = this.local.snapshot();

        if (strategy === 'serverToLocal') {
          this.local.replaceAll(serverItems);
          return of(this.local.snapshot());
        }

        if (strategy === 'localToServer') {
          return this.putServer(mode, localItems).pipe(
            tap(items => this.local.replaceAll(items)),
            map(() => this.local.snapshot()),
          );
        }

        // merge
        const merged = mergeByUpdatedAt(localItems, serverItems);
        this.local.replaceAll(merged);

        return this.putServer(mode, merged).pipe(
          tap(items => this.local.replaceAll(items)),
          map(() => this.local.snapshot()),
        );
      }),
      // опционально: если токен умер — можно просто отдать локал
      catchError(err => throwError(() => err)),
    );
  }

  private getServer(mode: Mode): Observable<TrackedItem[]> {
    return this.http
      .get<GetTrackedResp>(`${API_BASE_URL}/tracked`, { params: { mode } })
      .pipe(map(res => (res.items ?? []).map(normalize)));
  }

  private putServer(mode: Mode, items: TrackedItem[]): Observable<TrackedItem[]> {
    const body: PutTrackedReq = { items: items.map(normalize) };
    return this.http
      .put<PutTrackedResp>(`${API_BASE_URL}/tracked`, body, { params: { mode } })
      .pipe(map(res => (res.items ?? []).map(normalize)));
  }
}

/** LWW merge + аккуратно тянем iconLink если у победителя null */
function mergeByUpdatedAt(local: TrackedItem[], server: TrackedItem[]): TrackedItem[] {
  const byId = new Map<string, TrackedItem>();

  for (const x of server ?? []) {
    const n = normalize(x);
    if (n.id) byId.set(n.id, n);
  }

  for (const x of local ?? []) {
    const n = normalize(x);
    if (!n.id) continue;

    const prev = byId.get(n.id);
    if (!prev) {
      byId.set(n.id, n);
      continue;
    }

    const winner = n.updatedAt >= prev.updatedAt ? n : prev;
    const loser = winner === n ? prev : n;

    byId.set(n.id, {
      id: n.id,
      updatedAt: winner.updatedAt,
      iconLink: winner.iconLink ?? loser.iconLink ?? null,
    });
  }

  return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

function normalize(x: TrackedItem): TrackedItem {
  return {
    id: String(x?.id ?? ''),
    iconLink: x?.iconLink ? String(x.iconLink) : null,
    updatedAt: Number(x?.updatedAt ?? Date.now()),
  };
}
