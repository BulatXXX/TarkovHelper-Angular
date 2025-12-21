import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemService } from '../../services/item-service';
import { ItemDetails } from '../../models/item';

type ViewModel =
  | { state: 'loading' }
  | { state: 'ready'; item: ItemDetails }
  | { state: 'error'; id: string; message: string };

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './item-details.html',
  styleUrl: './item-details.scss',
})
export class ItemDetailsPage {
  private route = inject(ActivatedRoute);
  private api = inject(ItemService);

  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

  viewModel$ = this.route.paramMap.pipe(
    map(pm => pm.get('id') ?? ''),
    switchMap(id =>
      this.api.getItemById({ id, lang: 'en', gamemode: 'pve' }).pipe(
        map(item => ({ state: 'ready', item } as ViewModel)),
        catchError(err =>
          of({
            state: 'error',
            id,
            message: String(err?.message ?? err),
          } as ViewModel),
        ),
      ),
    ),
  );
}
