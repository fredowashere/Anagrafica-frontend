import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Azienda } from '../models/azienda';
import { PrepareObject } from '../models/prepare-object';
import { AziendeGruppoService } from '../services/aziende-gruppo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AziendaGruppoCreazioneModifica } from '../dialogs/aziende-gruppo-creazione-modifica/aziende-gruppo-creazione-modifica.component';

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
    private aziendeGruppoService: AziendeGruppoService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {

    this.aziendeGruppoService
      .prepareRagioniSociali()
      .subscribe(ragioniSociali =>
        this.formeAziendali = ragioniSociali
      );

    this.aziendeGruppoService
      .prepareTipologieContratto()
      .subscribe(tipologieContratti =>
        this.tipologieContratti = tipologieContratti
      );

    this.aziendeGruppoService
      .prepareSettoriMerceologici()
      .subscribe(settoriMerceologici =>
        this.settoriMerceologici = settoriMerceologici
      );

    this.refresh$
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.aziendeGruppoService.aziendeGruppo({
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

  getCreazioneModificaDialog() {
    return this.modalService.open(
      AziendaGruppoCreazioneModifica,
      { size: 'lg', centered: true }
    );
  }

  async create() {
    
    const modalRef = this.getCreazioneModificaDialog();
    await modalRef.result;

    this.refresh$.next();
  }

  async update(item: Azienda) {

    const modalRef = this.getCreazioneModificaDialog();
    modalRef.componentInstance.itemToUpdate = item;
    await modalRef.result;

    this.refresh$.next();
  }

  async readonly(item: Azienda) {
    const modalRef = this.getCreazioneModificaDialog();
    modalRef.componentInstance.readonlyItem = true;
    modalRef.componentInstance.itemToUpdate = item;
    await modalRef.result;
  }

  nop() {}
  
}
