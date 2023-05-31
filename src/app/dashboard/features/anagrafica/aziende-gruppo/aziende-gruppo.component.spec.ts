import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AziendeGruppoComponent } from './aziende-gruppo.component';

describe('AziendeGruppoComponent', () => {
  let component: AziendeGruppoComponent;
  let fixture: ComponentFixture<AziendeGruppoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AziendeGruppoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AziendeGruppoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
