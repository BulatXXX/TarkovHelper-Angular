import {Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TrackedItemsService} from '../../../../core/services/items-tracked';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private trackedService = inject(TrackedItemsService);

  tracked = toSignal(this.trackedService.tracked$, { initialValue: [] });

  // base64 нельзя с ngSrc, поэтому обычный src + файл из assets

  isEmpty = computed(() => this.tracked().length === 0);
}

