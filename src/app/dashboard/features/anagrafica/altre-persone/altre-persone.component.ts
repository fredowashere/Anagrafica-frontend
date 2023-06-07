import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, lastValueFrom, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { Contatto } from '../models/contatto';
import { PrepareObject } from '../models/prepare-object';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltrePersoneCreazioneModifica } from '../dialogs/altre-persone-creazione-modifica/altre-persone-creazione-modifica.component';
import { EliminazioneDialog } from '../../commons/dialogs/eliminazione.dialog';
import { ToastService } from 'src/app/services/toast.service';
import { AltrePersoneService } from '../services/altre-persone.service';

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
    private altrePersoneService: AltrePersoneService,
    private modalService: NgbModal,
    private toaster: ToastService
  ) {}

  ngOnInit() {

    this.altrePersoneService
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
          this.altrePersoneService.altrePersone({
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

  getCreazioneModificaDialog() {
    return this.modalService.open(
      AltrePersoneCreazioneModifica,
      { size: 'lg', centered: true }
    );
  }

  async create() {
    
    const modalRef = this.getCreazioneModificaDialog();
    await modalRef.result;

    this.refresh$.next();
  }

  async update(item: Contatto) {

    const modalRef = this.getCreazioneModificaDialog();
    modalRef.componentInstance.itemToUpdate = item;
    await modalRef.result;

    this.refresh$.next();
  }

  async readonly(item: Contatto) {
    const modalRef = this.getCreazioneModificaDialog();
    modalRef.componentInstance.readonlyItem = true;
    modalRef.componentInstance.itemToUpdate = item;
    await modalRef.result;
  }

  async delete(item: Contatto) {

    const nome = item.cognome + ' ' + item.nome;

    const modalRef = this.modalService.open(
      EliminazioneDialog,
      { size: 'md', centered: true }
    );
    modalRef.componentInstance.name = nome;
    await modalRef.result;

    try {

      await lastValueFrom(
        this.altrePersoneService.eliminaContatto(item.idUtente)
      );

      this.toaster.show(nome + " eliminato con successo!", { classname: "bg-success text-light" });
      this.refresh$.next();
    }
    catch(ex) {
      this.toaster.show("Si è verificato un errore durante l'eliminazione di " + nome + ". Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
    }
  }

}
