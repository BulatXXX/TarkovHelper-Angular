import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import {API_BASE_URL} from '../api/api.config';
import {AuthState, AuthTokens, AuthUser} from './auth.types';

type LoginReq = { email: string; password: string };
type RegisterReq = { email: string; password: string; name: string };

type LoginResp = { tokens: AuthTokens; user: AuthUser };
type RegisterResp = { tokens: AuthTokens; user: AuthUser };
type MeResp = { user: AuthUser };

// если сделаешь refresh:
type RefreshResp = { tokens: AuthTokens };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly tokenKey = 'tarkov.auth.accessToken.v1';

  private readonly stateSubject = new BehaviorSubject<AuthState>(this.loadInitialState());
  readonly state$ = this.stateSubject.asObservable();

  /** sync snapshot */
  get snapshot(): AuthState {
    return this.stateSubject.value;
  }

  get accessToken(): string | null {
    const s = this.snapshot;
    return s.status === 'auth' ? s.accessToken : null;
  }

  /** true если есть токен */
  get isAuthed(): boolean {
    return !!this.accessToken;
  }

  login(req: LoginReq): Observable<AuthUser> {
    return this.http.post<LoginResp>(`${API_BASE_URL}/auth/login`, req).pipe(
      tap(res => this.setAuth(res.tokens.accessToken, res.user)),
      map(res => res.user),
    );
  }

  register(req: RegisterReq): Observable<AuthUser> {
    return this.http.post<RegisterResp>(`${API_BASE_URL}/auth/register`, req).pipe(
      tap(res => this.setAuth(res.tokens.accessToken, res.user)),
      map(res => res.user),
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<MeResp>(`${API_BASE_URL}/auth/me`).pipe(
      tap(res => this.setUser(res.user)),
      map(res => res.user),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.stateSubject.next({ status: 'guest' });
  }

  /**
   * Опционально: refresh.
   * Если не делаешь refresh на бэке — можешь оставить метод, но он будет падать.
   */
  refresh(): Observable<string> {
    return this.http.post<RefreshResp>(`${API_BASE_URL}/auth/refresh`, {}).pipe(
      tap(res => {
        const s = this.snapshot;
        if (s.status === 'auth') {
          this.setAuth(res.tokens.accessToken, s.user);
        } else {
          // если вдруг guest — просто сохраняем токен, а user потом подтянем через me()
          this.setAuth(res.tokens.accessToken, { id: 'me', name: 'User' });
        }
      }),
      map(res => res.tokens.accessToken),
    );
  }

  // ===== internal =====

  private loadInitialState(): AuthState {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return { status: 'guest' };

    // user подтянем позже через me(); пока — заглушка
    return { status: 'auth', accessToken: token, user: { id: 'me', name: 'Singularity', avatarUrl: null } };
  }

  private setAuth(accessToken: string, user: AuthUser) {
    localStorage.setItem(this.tokenKey, accessToken);
    this.stateSubject.next({ status: 'auth', accessToken, user });
  }

  private setUser(user: AuthUser) {
    const s = this.snapshot;
    if (s.status !== 'auth') return;
    this.stateSubject.next({ ...s, user });
  }
}
