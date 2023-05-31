import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { AnagraficaService } from '../services/anagrafica.service';
import { Azienda } from '../models/azienda';

@Component({
  selector: 'app-aziende-gruppo',
  templateUrl: './aziende-gruppo.component.html',
  styleUrls: ['./aziende-gruppo.component.css']
})
export class AziendeGruppoComponent {

  refresh$ = new Subject<void>();
  destroy$ = new Subject<void>();
  isLoading = false;
  init = false;
  aziende: Azienda[] = [];

  descrizioneCtrl = new FormControl();

  formeAziendali = [];
  formaAziendaleCtrl = new FormControl();
  
  tipologieContratti = [];
  tipologiaContrattoCtrl = new FormControl();

  settoriMerceologici = [];
  settoreMerceologicoCtrl = new FormControl();

  constructor(
    private anagraficaService: AnagraficaService
  ) {}

  ngOnInit() {
    this.refresh$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.anagraficaService.aziendeGruppo({})
        ),
        tap(response => {
          this.aziende = response;
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
