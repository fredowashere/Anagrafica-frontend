import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { AnagraficaService } from '../services/anagrafica.service';
import { Contatto } from '../models/contatto';
import { UtentiAnagrafica } from 'src/app/api/modulo-attivita/models';
import { PrepareObject } from '../models/prepare-object';

@Component({
  selector: 'app-altre-persone',
  templateUrl: './altre-persone.component.html',
  styleUrls: ['./altre-persone.component.css']
})
export class AltrePersoneComponent {

  refresh$ = new Subject<void>();
  destroy$ = new Subject<void>();
  isLoading = false;
  init = false;
  contatti: Contatto[] = [];

  cognomeCtrl = new FormControl();
  nomeCtrl = new FormControl();
  
  referenti: PrepareObject[] = [];
  referenteCtrl = new FormControl();
  referenteFormatter = (po: PrepareObject) => po.descrizione;

  form = new FormGroup({
    cognome: this.cognomeCtrl,
    nome: this.nomeCtrl,
    referente: this.referenteCtrl
  });

  constructor(
    private anagraficaService: AnagraficaService
  ) {}

  ngOnInit() {

    this.anagraficaService
      .prepareReferenti()
      .subscribe(referenti =>
        this.referenti = referenti
      );

    merge(
      of({}), // Launch as soon as the user lands
      this.refresh$
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.anagraficaService.altrePersone({
            cognome: this.cognomeCtrl.value,
            nome: this.nomeCtrl.value,
            idReferente: this.referenteCtrl.value?.id
          })
        ),
        tap(response => {
          this.contatti = response;
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
