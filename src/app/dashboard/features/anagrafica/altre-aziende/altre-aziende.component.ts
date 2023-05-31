import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { AnagraficaService } from '../services/anagrafica.service';
import { Cliente } from '../models/cliente';

@Component({
  selector: 'app-altre-aziende',
  templateUrl: './altre-aziende.component.html',
  styleUrls: ['./altre-aziende.component.css']
})
export class AltreAziendeComponent {

  refresh$ = new Subject<void>();
  destroy$ = new Subject<void>();
  isLoading = false;
  init = false;
  clienti: Cliente[] = [];

  nomeAziendaCtrl = new FormControl();
  partitaIVACtrl = new FormControl();
  
  aziende = [];
  aziendaCorrispondenteCtrl = new FormControl();

  formeAziendali = [];
  formaAziendaleCtrl = new FormControl();

  businessUnit = [];
  businessUnitCtrl = new FormControl();

  tipiContratti = [];
  tipoContrattoCtrl = new FormControl();

  settoriMerceologici = [];
  settoreMerceologicoCtrl = new FormControl();

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
          this.anagraficaService.terzePartiSearch({})
        ),
        tap(response => {
          this.clienti = response;
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
