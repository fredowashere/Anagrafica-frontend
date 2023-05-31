import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnagraficaService } from '../services/anagrafica.service';
import { Subject, merge, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { Person } from '../models/persona';

@Component({
  selector: 'app-persone-organico',
  templateUrl: './persone-organico.component.html',
  styleUrls: ['./persone-organico.component.css']
})
export class PersoneOrganicoComponent implements OnInit, OnDestroy {

  refresh$ = new Subject<void>();
  destroy$ = new Subject<void>();
  isLoading = false;
  init = false;
  persone: Person[] = [];

  cognomeCtrl = new FormControl();
  nomeCtrl = new FormControl();
  nrBadgeCtrl = new FormControl();
  
  tipiUtente = [];
  tipoUtenteCtrl = new FormControl();

  businessUnit = [];
  businessUnitCtrl = new FormControl();

  constructor(
    private anagraficaService: AnagraficaService
  ) {}

  ngOnInit() {
    merge(
      of({}), // Launch as soon as the user lands
      this.refresh$
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.anagraficaService.findPerson({})
        ),
        tap(response => {
          this.persone = response;
          this.isLoading = false;
          if (!this.init) this.init = true;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  nop() {}

}

