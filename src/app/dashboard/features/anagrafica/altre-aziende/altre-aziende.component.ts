import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { Cliente } from '../models/cliente';
import { PrepareObject } from '../models/prepare-object';
import { AltreAziendeService } from '../services/altre-aziende.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltreAziendeCreazioneModifica } from '../dialogs/altre-aziende-creazione-modifica/altre-aziende-creazione-modifica.component';
import { SelectOption } from 'src/app/shared/components/input/input.component';

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
  
  aziende: PrepareObject[] = [];
  aziendaCorrispondenteCtrl = new FormControl();
  genericFormatter = (po: PrepareObject) => po.descrizione;

  formeAziendali: PrepareObject[] = [];
  formaAziendaleCtrl = new FormControl();

  businessUnit: PrepareObject[] = [];
  businessUnitCtrl = new FormControl();

  tipi: SelectOption[] = [];
  tipoCtrl = new FormControl();

  settoriMerceologici: PrepareObject[] = [];
  settoreMerceologicoCtrl = new FormControl();

  form = new FormGroup({
    nomeAzienda: this.nomeAziendaCtrl,
    partitaIVA: this.partitaIVACtrl,
    aziendaCorrispondente: this.aziendaCorrispondenteCtrl,
    formaAziendale: this.formaAziendaleCtrl,
    businessUnit: this.businessUnitCtrl,
    tipo: this.tipoCtrl,
    settoreMerceologico: this.settoreMerceologicoCtrl
  });

  constructor(
    private altreAziendeService: AltreAziendeService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {

    this.altreAziendeService
      .terzePartiPrepareSearchFilters()
      .subscribe(formLists => {

        this.aziende = formLists.AZIENDE_GRUPPO;
        this.formeAziendali = formLists.RAGIONI_SOCIALI;
        this.businessUnit = formLists.BUSINESS_UNIT;
        this.settoriMerceologici = formLists.SETTORI_MERCEOLOGICI;

        this.tipi = formLists.TIPI_TERZE_PARTI
          .map(({ id, descrizione }) =>
            ({ value: id, text: descrizione })
          );
        this.tipi.unshift({ value: null, text: "Tutti" });
      });

    merge(
      of({}), // Launch as soon as the user lands
      this.refresh$
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.altreAziendeService.terzePartiSearch({
            descrizione: this.nomeAziendaCtrl.value,
            idBu: this.businessUnitCtrl.value?.id,
            idTipoTerzeParti: this.tipoCtrl.value?.id,
            idSettoreMerceologico: this.settoreMerceologicoCtrl.value?.id,
            idRagioneSociale: this.formaAziendaleCtrl.value?.id,
            idAziendaGruppo: this.aziendaCorrispondenteCtrl.value?.id,
            partitaIva: this.partitaIVACtrl.value?.id,
          })
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

  getCreazioneModificaDialog() {
    return this.modalService.open(
      AltreAziendeCreazioneModifica,
      { size: 'lg', centered: true }
    );
  }

  async create() {
    
    const modalRef = this.getCreazioneModificaDialog();
    await modalRef.result;

    this.refresh$.next();
  }

  async update(item: Cliente) {

    const modalRef = this.getCreazioneModificaDialog();
    modalRef.componentInstance.itemToUpdate = item;
    await modalRef.result;

    this.refresh$.next();
  }

  async readonly(item: Cliente) {
    const modalRef = this.getCreazioneModificaDialog();
    modalRef.componentInstance.readonlyItem = true;
    modalRef.componentInstance.itemToUpdate = item;
    await modalRef.result;
  }

  nop() {}

}
