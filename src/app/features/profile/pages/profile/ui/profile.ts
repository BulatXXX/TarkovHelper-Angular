import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, map} from 'rxjs';

import {Mode, ProfileViewModel} from '../profile-view-model';
import {TPipe} from '../../../../../core/i18n/t.pipe';
import {SettingsService} from '../../../../../core/services/settings-service';

import {AuthService} from '../../../../../core/auth/auth.service';
import {SyncService, SyncStrategy} from '../../../../../core/services/sync.service';

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

  rows = toSignal(this.vm.rows$, { initialValue: [] });
  isEmpty = computed(() => this.rows().length === 0);

  mode = toSignal(
    this.settings.settings$.pipe(
      map(s => (s.mode as Mode) ?? 'pvp'),
      distinctUntilChanged(),
    ),
    { initialValue: 'pvp' as Mode }
  );

  private authState = toSignal(this.auth.state$, { initialValue: { status: 'guest' } as any });
  isAuthed = computed(() => this.authState()?.status === 'auth');
  userName = computed(() =>
    this.authState()?.status === 'auth' ? this.authState().user.name : 'User'
  );

  // dialog
  syncDialogOpen = signal(false);
  syncing = signal(false);
  syncError = signal<string | null>(null);

  setMode(mode: Mode) {
    this.settings.setMode(mode);
  }

  openSyncDialog() {
    this.syncError.set(null);
    this.syncDialogOpen.set(true);
  }

  closeSyncDialog() {
    if (this.syncing()) return; // чтобы не закрыть во время запроса
    this.syncDialogOpen.set(false);
  }

  runSync(strategy: SyncStrategy) {
    this.syncError.set(null);
    this.syncing.set(true);

    this.sync.sync(this.mode(), strategy).subscribe({
      next: () => {
        this.syncing.set(false);
        this.syncDialogOpen.set(false);
      },
      error: (e) => {
        this.syncing.set(false);
        this.syncError.set(String(e?.message ?? e));
      },
    });
  }

  logout() {
    this.auth.logout();
    this.syncDialogOpen.set(false);
  }

  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
}
