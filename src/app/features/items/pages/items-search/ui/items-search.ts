import {Component, DestroyRef, ElementRef, inject} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {ItemSearchViewModel} from '../item-search-view-model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './items-search.html',
  styleUrl: './items-search.scss',
})
export class ItemsSearch {
  private vm = inject(ItemSearchViewModel);
  private destroyRef = inject(DestroyRef);
  private host = inject(ElementRef<HTMLElement>);

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

  onFocusIn() {
    this.vm.setShowHistory(true);
  }

  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;

    // если фокус ушёл вообще "в никуда" или на элемент вне контейнера — закрываем
    if (!next || !this.host.nativeElement.contains(next)) {
      this.vm.setShowHistory(false);
    }
  }

  clearHistory() {
    this.vm.clearHistory();
  }

  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
}
