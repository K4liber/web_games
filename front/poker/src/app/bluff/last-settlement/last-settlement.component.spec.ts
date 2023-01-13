import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastSettlementComponent } from './last-settlement.component';

describe('LastSettlementComponent', () => {
  let component: LastSettlementComponent;
  let fixture: ComponentFixture<LastSettlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastSettlementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastSettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
