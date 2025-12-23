import {Routes} from '@angular/router';
import {NotFoundComponent} from './layout/not-found';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'items' },
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./features/items/pages/item-details/ui/item-details').then(m => m.ItemDetailsPage),
  },
  {
    path: 'items',
    loadComponent:()=>import('./features/items/pages/items-search/ui/items-search').then(m => m.ItemsSearch)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/pages/profile/ui/profile')
        .then(m => m.Profile),
  },
  { path: '**', component: NotFoundComponent },

];
