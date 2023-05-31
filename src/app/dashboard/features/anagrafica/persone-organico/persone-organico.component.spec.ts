import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersoneOrganicoComponent } from './persone-organico.component';

describe('PersoneOrganicoComponent', () => {
  let component: PersoneOrganicoComponent;
  let fixture: ComponentFixture<PersoneOrganicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersoneOrganicoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersoneOrganicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
