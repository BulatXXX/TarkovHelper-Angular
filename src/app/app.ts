import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AppHeader} from './layout/header';
import {AuthService} from './core/auth/auth.service';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(AuthService);
  protected readonly title = signal('TarkovHelper');
  constructor() {
    if (this.auth.isAuthed) {
      this.auth.me().pipe(
        catchError(() => {
          this.auth.logout();
          return of(null);
        })
      ).subscribe();
    }
  }
}
