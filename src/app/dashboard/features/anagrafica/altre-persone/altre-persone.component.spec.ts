import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltrePersoneComponent } from './altre-persone.component';

describe('AltrePersoneComponent', () => {
  let component: AltrePersoneComponent;
  let fixture: ComponentFixture<AltrePersoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltrePersoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltrePersoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
