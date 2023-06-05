import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { AnagraficaService } from '../services/anagrafica.service';
import { Azienda } from '../models/azienda';
import { PrepareObject } from '../models/prepare-object';

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

  formeAziendali: PrepareObject[] = [];
  formaAziendaleCtrl = new FormControl();
  genericFormatter = (po: PrepareObject) => po.descrizione;
  
  tipologieContratti: PrepareObject[] = [];
  tipologiaContrattoCtrl = new FormControl();

  settoriMerceologici: PrepareObject[] = [];
  settoreMerceologicoCtrl = new FormControl();

  form = new FormGroup({
    descrizione: this.descrizioneCtrl,
    formaAziendale: this.formaAziendaleCtrl,
    tipologiaContratto: this.tipologiaContrattoCtrl,
    settoreMerceologico: this.settoreMerceologicoCtrl
  });

  constructor(
    private anagraficaService: AnagraficaService
  ) {}

  ngOnInit() {

    this.anagraficaService
      .prepareRagioniSociali()
      .subscribe(ragioniSociali =>
        this.formeAziendali = ragioniSociali
      );

    this.anagraficaService
      .prepareTipologieContratto()
      .subscribe(tipologieContratti =>
        this.tipologieContratti = tipologieContratti
      );

    this.anagraficaService
      .prepareSettoriMerceologici()
      .subscribe(settoriMerceologici =>
        this.settoriMerceologici = settoriMerceologici
      );

    this.refresh$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.anagraficaService.aziendeGruppo({
            descrizione: this.descrizioneCtrl.value,
            idRagioneSociale: this.formaAziendaleCtrl.value?.id,
            idSettoreMerceologico: this.settoreMerceologicoCtrl.value?.id,
            idTipologiaContratto: this.tipologiaContrattoCtrl.value?.id
          })
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
