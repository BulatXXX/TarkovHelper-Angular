import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemService } from '../../services/item-service';
import { ItemPreview } from '../../models/item';

type ViewModel =
  | { state: 'idle'; items: ItemPreview[] }
  | { state: 'loading'; items: ItemPreview[] }
  | { state: 'ready'; items: ItemPreview[] }
  | { state: 'error'; items: ItemPreview[]; message: string };

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './items-search.html',
  styleUrl: './items-search.scss',
})
export class ItemsSearch {
  private api = inject(ItemService);

  query = new FormControl('', { nonNullable: true });

  viewModel$ = this.query.valueChanges.pipe(
    startWith(this.query.value),
    map(v => v.trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(name => {
      if (name.length < 2) return of({ state: 'idle', items: [] } as ViewModel);

      return this.api.searchItems({ name, lang: 'en', gamemode: 'pve' }).pipe(
        map(items => ({ state: 'ready', items } as ViewModel)),
        startWith({ state: 'loading', items: [] } as ViewModel),
        catchError(err => of({ state: 'error', items: [], message: String(err?.message ?? err) } as ViewModel)),
      );
    }),
  );

  // маленький fallback для ngSrc, чтобы не было пустых src
  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
}
