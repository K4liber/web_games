import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantumComponent } from './quantum.component';

describe('QuantumComponent', () => {
  let component: QuantumComponent;
  let fixture: ComponentFixture<QuantumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
