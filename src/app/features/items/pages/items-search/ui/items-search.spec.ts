import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsSearch } from './items-search';

describe('ItemsSearch', () => {
  let component: ItemsSearch;
  let fixture: ComponentFixture<ItemsSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemsSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
