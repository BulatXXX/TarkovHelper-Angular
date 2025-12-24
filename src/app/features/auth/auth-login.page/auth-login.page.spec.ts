import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthLoginPage} from './auth-login.page';

describe('AuthLoginPage', () => {
  let component: AuthLoginPage;
  let fixture: ComponentFixture<AuthLoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLoginPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
