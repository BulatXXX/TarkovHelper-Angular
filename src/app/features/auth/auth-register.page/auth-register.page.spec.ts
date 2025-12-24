import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthRegisterPage} from './auth-register.page';

describe('AuthRegisterPage', () => {
  let component: AuthRegisterPage;
  let fixture: ComponentFixture<AuthRegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRegisterPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthRegisterPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
