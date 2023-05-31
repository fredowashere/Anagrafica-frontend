import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltreAziendeComponent } from './altre-aziende.component';

describe('AltreAziendeComponent', () => {
  let component: AltreAziendeComponent;
  let fixture: ComponentFixture<AltreAziendeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltreAziendeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltreAziendeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
