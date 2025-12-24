import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {map} from 'rxjs';

import {AuthService} from '../core/auth/auth.service';
import {TPipe} from '../core/i18n/t.pipe';
import {url} from 'zod';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, AsyncPipe, TPipe],
  template: `
    <header class="hdr">
      <div class="hdr__inner">
        <a
          class="pill pill--brand"
          routerLink="/items"
          [attr.aria-label]="(('header.searchAria' | t | async) ?? 'Open search')"
        >
          TarkovHelper
        </a>

        <a
          class="pill pill--user"
          routerLink="/profile"
          [attr.aria-label]="(('header.profileAria' | t | async) ?? 'Open profile')"
        >
          <span class="avatar" aria-hidden="true">
            @if (isAuthed$ | async) {
              @if (avatarUrl$ | async) {
                <img class="avatar__img" [src]="(avatarUrl$ | async)!" alt="" />
              } @else {
                <span class="avatar__fallback">{{ (initial$ | async) ?? 'U' }}</span>
              }
            } @else {
              <span class="avatar__fallback">★</span>
            }
          </span>

          <span class="pill__text">
            @if (isAuthed$ | async) {
              {{ (name$ | async) ?? 'User' }}
            } @else {
              Tracked items
            }
          </span>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .hdr{
      position: sticky;
      top: 0;
      z-index: 50;

      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.10);

      background: rgba(0,0,0,0.25);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .hdr__inner{
      max-width: 980px;
      margin: 0 auto;

      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 12px;

      min-width: 0;
    }

    .pill{
      display: inline-flex;
      align-items: center;
      gap: 10px;

      padding: 8px 12px;
      border-radius: 999px;

      text-decoration: none;
      color: rgba(255,255,255,0.90);
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.04);

      transition: 140ms ease;
      min-width: 0;
      white-space: nowrap;
    }

    .pill:hover{
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.95);
    }

    .pill--brand{
      justify-self: start;
      font-family: var(--font-display);
      letter-spacing: 0.6px;
    }

    .pill--user{
      justify-self: end;
      max-width: 240px;
    }

    .pill__text{
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .avatar{
      width: 26px;
      height: 26px;
      border-radius: 10px;

      display: grid;
      place-items: center;

      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.12);
      overflow: hidden;
      flex: 0 0 auto;
    }

    .avatar__img{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .avatar__fallback{
      font-family: var(--font-display);
      font-size: 12px;
      letter-spacing: 0.6px;
      opacity: 0.95;
    }

    @media (max-width: 599px){
      .hdr{ padding: 10px 12px; }
      .pill{ padding: 8px 10px; }
      .pill--user{ max-width: 200px; }
    }
  `],
})
export class AppHeader {
  private auth = inject(AuthService);

  readonly state$ = this.auth.state$;

  readonly isAuthed$ = this.state$.pipe(map(s => s.status === 'auth'));

  readonly name$ = this.state$.pipe(
    map(s => (s.status === 'auth' ? s.user.name : null))
  );

  readonly avatarUrl$ = this.state$.pipe(
    map(s => (s.status === 'auth' ? (s.user.avatarUrl ?? null) : null))
  );

  readonly initial$ = this.name$.pipe(
    map(name => {
      const n = (name ?? 'U').trim();
      return (n[0] ?? 'U').toUpperCase();
    })
  );
  protected readonly url = url;
}
