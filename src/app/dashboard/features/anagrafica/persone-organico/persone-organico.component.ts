import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AnagraficaService } from '../services/anagrafica.service';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { Person } from '../models/persona';
import { PrepareObject } from '../models/prepare-object';

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
  
  tipiUtente: { value: number | null, text: string }[] = [];
  tipoUtenteCtrl = new FormControl();

  businessUnit: PrepareObject[] = [];
  businessUnitCtrl = new FormControl();
  businessUnitFormatter = (po: PrepareObject) => po.descrizione;

  form = new FormGroup({
    cognome: this.cognomeCtrl,
    nome: this.nomeCtrl,
    tipoUtente: this.tipoUtenteCtrl,
    businessUnit: this.businessUnitCtrl
  });

  constructor(
    private anagraficaService: AnagraficaService
  ) {}

  ngOnInit() {

    this.anagraficaService
      .prepareTipiUtente()
      .subscribe(tipiUtente => {
        this.tipiUtente = tipiUtente
          .map(({ id, descrizione }) =>
            ({ value: id, text: descrizione })
          );
        this.tipiUtente.unshift({ value: null, text: "Tutti" });
      });

    this.anagraficaService
      .prepareBusinessUnit()
      .subscribe(businessUnit => {
        this.businessUnit = businessUnit
          .filter(({ id, descrizione }) => id && descrizione)
          .sort((a, b) => a.id - b.id);
      });

    merge(
      of({}), // Launch as soon as the user lands
      this.refresh$
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.anagraficaService.findPerson({
            cognome: this.cognomeCtrl.value,
            nome: this.nomeCtrl.value,
            numeroBadge: this.nrBadgeCtrl.value,
            idBusinessUnit: this.businessUnitCtrl.value?.id,
            idTipologia: this.tipoUtenteCtrl.value
          })
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

