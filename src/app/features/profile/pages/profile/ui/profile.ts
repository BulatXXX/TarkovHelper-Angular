// src/app/features/profile/pages/profile/ui/profile.ts
import {Component, computed, effect, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, map} from 'rxjs';

import {Mode, ProfileViewModel} from '../profile-view-model';
import {TPipe} from '../../../../../core/i18n/t.pipe';
import {SettingsService} from '../../../../../core/services/settings-service';

import {AuthService} from '../../../../../core/auth/auth.service';
import {SyncService, SyncStrategy, SyncUiState} from '../../../../../core/services/sync.service';
import {TrackedItemsService} from '../../../../../core/services/items-tracked';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TPipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  providers: [ProfileViewModel],
})
export class Profile {
  private vm = inject(ProfileViewModel);
  private settings = inject(SettingsService);
  private auth = inject(AuthService);
  private sync = inject(SyncService);
  private tracked = inject(TrackedItemsService);

  rows = toSignal(this.vm.rows$, { initialValue: [] });
  isEmpty = computed(() => this.rows().length === 0);

  // mode — только для цен/загрузки айтемов, НЕ для синка
  mode = toSignal(
    this.settings.settings$.pipe(
      map(s => (s.mode as Mode) ?? 'pvp'),
      distinctUntilChanged(),
    ),
    { initialValue: 'pvp' as Mode }
  );

  private authState = toSignal(this.auth.state$, { initialValue: { status: 'guest' } as any });
  isAuthed = computed(() => this.authState()?.status === 'auth');
  userName = computed(() => (this.authState()?.status === 'auth' ? this.authState().user.name : 'User'));

  // локальный список как сигнал — чтобы compare триггерился при изменениях
  private localTracked = toSignal(this.tracked.tracked$, { initialValue: [] });

  // dialog
  syncDialogOpen = signal(false);

  // sync ui state (ВАЖНО: строгий тип)
  syncUi = toSignal<SyncUiState>(this.sync.uiState$, { requireSync: true });

  syncCompare = computed(() => {
    const s = this.syncUi();
    return (s.status === 'inSync' || s.status === 'outOfSync') ? s.compare : null;
  });

  syncErrorMsg = computed(() => {
    const s = this.syncUi();
    return s.status === 'error' ? s.message : null;
  });

  isSyncing = computed(() => this.syncUi().status === 'syncing' || this.syncUi().status === 'checking');

  constructor() {
    // если авторизован + меняется локальный список => пересчитай diff
    effect(() => {
      if (!this.isAuthed()) return;
      this.localTracked(); // dependency
      this.sync.compare().subscribe({ error: () => {} });
    });
  }

  setMode(mode: Mode) {
    this.settings.setMode(mode);
  }

  openSyncDialog() {
    this.syncDialogOpen.set(true);
    if (this.isAuthed()) this.sync.compare().subscribe({ error: () => {} });
  }

  closeSyncDialog() {
    if (this.isSyncing()) return;
    this.syncDialogOpen.set(false);
  }

  runSync(strategy: SyncStrategy) {
    this.sync.sync(strategy).subscribe({
      next: () => this.syncDialogOpen.set(false),
      error: () => {}, // uiState уже error
    });
  }

  logout() {
    this.auth.logout();
    this.syncDialogOpen.set(false);
  }

  // бейдж на облаке: ↻ / ✓ / ! / ×
  cloudBadge = computed(() => {
    const st = this.syncUi().status;
    if (st === 'checking' || st === 'syncing') return '↻';
    if (st === 'inSync') return '✓';
    if (st === 'outOfSync') return '!';
    if (st === 'error') return '×';
    return '';
  });

  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
}
