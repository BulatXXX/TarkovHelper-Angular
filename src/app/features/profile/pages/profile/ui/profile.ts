import {Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, map} from 'rxjs';
import {Mode, ProfileViewModel} from '../profile-view-model';
import {TPipe} from '../../../../../core/i18n/t.pipe';
import {SettingsService} from '../../../../../core/services/settings-service';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TPipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  providers: [ProfileViewModel], // ✅ VM на экран
})
export class Profile {
  private vm = inject(ProfileViewModel);
  private settings = inject(SettingsService);

  rows = toSignal(this.vm.rows$, { initialValue: [] });

  isEmpty = computed(() => this.rows().length === 0);

  mode = toSignal(
    this.settings.settings$.pipe(
      map(s => (s.mode as Mode) ?? 'pvp'),
      distinctUntilChanged(),
    ),
    { initialValue: 'pvp' as Mode }
  );

  setMode(mode: Mode) {
    this.settings.setMode(mode);
  }

  placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
}
