import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./features/items/pages/item-details/item-details').then(m => m.ItemDetailsPage),
  },
  {
    path: 'items',
    loadComponent:()=>import('./features/items/pages/items-search/items-search').then(m => m.ItemsSearch)
  }
];
