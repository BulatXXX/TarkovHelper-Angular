import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemPreview } from '../../features/items/models/item';

type TrackedEntry = ItemPreview & { addedAt: number };

@Injectable({ providedIn: 'root' })
export class TrackedItemsService {
  private readonly key = 'tarkov.tracked.v1';
  private readonly subject = new BehaviorSubject<TrackedEntry[]>(this.load());

  tracked$ = this.subject.asObservable();

  isTracked(id: string): boolean {
    return this.subject.value.some(x => x.id === id);
  }

  toggle(item: ItemPreview) {
    const current = this.subject.value;
    const exists = current.some(x => x.id === item.id);

    const next = exists
      ? current.filter(x => x.id !== item.id)
      : [{ ...item, addedAt: Date.now() }, ...current];

    this.subject.next(next);
    this.save(next);
  }

  private load(): TrackedEntry[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as TrackedEntry[]) : [];
    } catch {
      return [];
    }
  }

  private save(value: TrackedEntry[]) {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {}
  }
}
