import {Component, DestroyRef, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {ItemSearchViewModel} from '../item-search-view-model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TPipe} from '../../../../../core/i18n/t.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TPipe],
  templateUrl: './items-search.html',
  styleUrl: './items-search.scss',
})
export class ItemsSearch {
  private vm = inject(ItemSearchViewModel);
  private destroyRef = inject(DestroyRef);


  query = new FormControl(this.vm.getState.query, { nonNullable: true });
  viewModel$ = this.vm.state$;
  history$ = this.vm.history$; // если хочешь показывать историю

  constructor() {
    this.query.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.vm.setQuery(v));
  }

  // если сделаешь переключатель режима:
  setMode(mode: 'pve' | 'regular') { this.vm.setMode(mode); }


  clearHistory() {
    this.vm.clearHistory();
  }

  get isQueryEmpty(): boolean {
    return this.query.value.trim().length === 0;
  }

  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
}
