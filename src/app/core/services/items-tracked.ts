import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TrackedItem} from '../models/item';


@Injectable({ providedIn: 'root' })
export class TrackedItemsService {
  private readonly key = 'tarkov.tracked.v1';
  private readonly subject = new BehaviorSubject<TrackedItem[]>(this.load());

  tracked$ = this.subject.asObservable();

  isTracked(id: string): boolean {
    return this.subject.value.some(x => x.id === id);
  }

  toggle(item: TrackedItem) {
    const current = this.subject.value;
    const exists = current.some(x => x.id === item.id);

    const normalized: TrackedItem = {
      id: item.id,
      iconLink: item.iconLink ?? null,
      updatedAt: Date.now(),
    };

    const next = exists
      ? current.filter(x => x.id !== item.id)
      : [normalized, ...current];

    this.subject.next(next);
    this.save(next);
  }

  private load(): TrackedItem[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];

      return (parsed ?? [])
        .filter(x => x?.id)
        .map(x => ({
          id: String(x.id),
          iconLink: x.iconLink ? String(x.iconLink) : null,
          updatedAt: Number(x.addedAt ?? Date.now()),
        })) satisfies TrackedItem[];
    } catch {
      return [];
    }
  }

  private save(value: TrackedItem[]) {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {}
  }
}
