import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="hdr">
      <a class="brand" routerLink="/items">TarkovHelper</a>

      <nav class="nav">
        <a class="link" routerLink="/items" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Search
        </a>
        <a class="link" routerLink="/profile" routerLinkActive="active">
          Profile
        </a>
      </nav>
    </header>
  `,
  styles: [`
    .hdr{
      position: sticky; top: 0; z-index: 10;
      display:flex; align-items:center; justify-content:space-between; gap:16px;
      padding:12px 16px;
      border-bottom:1px solid rgba(255,255,255,.10);
      background: rgba(15,15,15,.85);
      backdrop-filter: blur(8px);
    }
    .brand{ font-weight:800; text-decoration:none; color:inherit; }
    .nav{ display:flex; gap:10px; }
    .link{
      text-decoration:none; color:inherit; opacity:.8;
      padding:8px 10px; border-radius:10px;
      border:1px solid transparent;
    }
    .link:hover{ opacity:1; background: rgba(255,255,255,.06); }
    .active{
      opacity:1;
      border-color: rgba(255,255,255,.18);
      background: rgba(255,255,255,.06);
    }
  `]
})
export class AppHeader {}
