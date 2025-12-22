import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./features/items/pages/item-details/ui/item-details').then(m => m.ItemDetailsPage),
  },
  {
    path: 'items',
    loadComponent:()=>import('./features/items/pages/items-search/ui/items-search').then(m => m.ItemsSearch)
  }
];
