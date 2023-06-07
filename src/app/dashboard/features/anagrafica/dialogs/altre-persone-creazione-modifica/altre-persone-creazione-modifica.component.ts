import { Component, Input, OnInit } from "@angular/core";
import { Contatto, DettaglioContatto } from "../../models/contatto";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PrepareObject } from "../../models/prepare-object";
import { combineLatest, lastValueFrom, map } from "rxjs";
import { AnagraficaService } from "../../services/anagrafica.service";
import { cellulareRegExp, telefonoRegExp } from "src/app/utils/regex";
import { lookmap, singlifyLookmap } from "src/app/utils/object";
import { ToastService } from "src/app/services/toast.service";

@Component({
    standalone: true,
    imports: [ CommonModule, SharedModule ],
    templateUrl: "./altre-persone-creazione-modifica.component.html",
    styleUrls: [ "./altre-persone-creazione-modifica.component.css" ]
})
export class AltrePersoneCreazioneModifica implements OnInit {

    @Input("itemToUpdate") itemToUpdate?: Contatto;
    @Input("readonlyItem") readonlyItem = false;
    contatto?: DettaglioContatto;
    aziendaLookup: { [key: number]: PrepareObject | undefined } = {};
    referenteLookup: { [key: number]: PrepareObject | undefined } = {};
    loading = false;

    // Stage 1
    cognomeCtrl = new FormControl("", [ Validators.required ]);
    nomeCtrl = new FormControl("", [ Validators.required ]);
    titoli: { value: number, text: string }[] = [];
    titoloCtrl = new FormControl(1);
    aziende: PrepareObject[] = [];
    aziendaCtrl = new FormControl<PrepareObject | null>(null, [ Validators.required ]);
    autocompleteFormatter = (po: PrepareObject) => po.descrizione;
    referenti: PrepareObject[] = [];
    referenteCtrl = new FormControl<PrepareObject | null>(null, [ Validators.required ]); 
    auguriCtrl = new FormControl<boolean>(false);

    stage1Form = new FormGroup({
        cognome: this.cognomeCtrl,
        nome: this.nomeCtrl,
        titolo: this.titoloCtrl,
        azienda: this.aziendaCtrl,
        referente: this.referenteCtrl,
        auguri: this.auguriCtrl
    });

    // Stage 2
    tecnoCodeCtrl = new FormControl("");
    telefonoCtrl = new FormControl("", [ Validators.pattern(telefonoRegExp) ]);
    cellulareCtrl = new FormControl("", [ Validators.pattern(cellulareRegExp) ]);
    emailCtrl = new FormControl("", [ Validators.email ]);
    referenteClienteCtrl = new FormControl<boolean>(false);
    indirizzi: PrepareObject[] = [];
    indirizzoCtrl = new FormControl<PrepareObject | null>(null);
    cittaCtrl = new FormControl("");
    provinciaCtrl = new FormControl("");
    capCtrl = new FormControl("");
    noteCtrl = new FormControl("");

    stage2Form = new FormGroup({
        telefono: this.telefonoCtrl,
        tecnoCode: this.tecnoCodeCtrl,
        cellulare: this.cellulareCtrl,
        email: this.emailCtrl,
        referenteCliente: this.referenteClienteCtrl,
        indirizzo: this.indirizzoCtrl,
        note: this.noteCtrl
    });

    // Stage 3
    telefonoPrivataCtrl = new FormControl("", [ Validators.pattern(telefonoRegExp) ]);
    cellularePrivataCtrl = new FormControl("", [ Validators.pattern(cellulareRegExp) ]);
    emailPrivataCtrl = new FormControl("", [ Validators.email ]);

    stage3Form = new FormGroup({
        telefonoPrivata: this.telefonoPrivataCtrl,
        cellularePrivata: this.cellularePrivataCtrl,
        emailPrivata: this.emailPrivataCtrl
    });

    constructor(
        public activeModal: NgbActiveModal,
        private anagraficaService: AnagraficaService,
        private toaster: ToastService
    ) {}

    async ngOnInit() {

        this.loading = true;

        // Get autocomplete lists
        [ this.titoli, this.aziende, this.referenti ] = await lastValueFrom(
            combineLatest([
                this.anagraficaService
                    .prepareTitoli()
                    .pipe(
                        map(titoli =>
                            titoli.map(({ id, descrizione }) =>
                                ({ value: id, text: descrizione })
                            )
                        )
                    ),
                this.anagraficaService.prepareAziendeClientiTerzeParti(),
                this.anagraficaService.prepareReferenti()
            ])
        );

        this.aziendaLookup = singlifyLookmap(lookmap("id", this.aziende));
        this.referenteLookup = singlifyLookmap(lookmap("id", this.referenti));

        this.loading = false;

        // Setup indirizzoCtrl reactivity (autopopulate citta, provincia and cap when possible)
        this.indirizzoCtrl.valueChanges
            .subscribe(async indirizzo => {

                if (!indirizzo) {
                    this.cittaCtrl.reset();
                    this.provinciaCtrl.reset();
                    this.capCtrl.reset();
                    return;
                }

                const indirizzoInfo = await lastValueFrom(
                    this.anagraficaService.prepareIndirizzoInfo({
                        idTerzaParte: this.aziendaCtrl.value?.id!,
                        indirizzo: indirizzo.descrizione
                    })
                );

                if (!indirizzoInfo) return;

                this.cittaCtrl.setValue(indirizzoInfo.comune);
                this.provinciaCtrl.setValue(indirizzoInfo.descProvincia);
                this.capCtrl.setValue(indirizzoInfo.cap);
            });

        // Setup aziendaCtrl reactivity (get indirizzi, autopopulate indirizzo if possible)
        this.aziendaCtrl.valueChanges
            .subscribe(async azienda => {

                if (!azienda) {
                    this.indirizzoCtrl.reset();
                    this.indirizzi = [];
                    return;
                }

                this.indirizzi = await lastValueFrom(
                    this.anagraficaService.prepareIndirizzo(azienda.id)
                );

                if (this.indirizzi.length === 1)
                    this.indirizzoCtrl.setValue(this.indirizzi[0]);
            });

        // Populate fields from response
        if (this.itemToUpdate) {

            this.loading = true;

            this.contatto = await lastValueFrom(
                this.anagraficaService.dettaglioContatto(this.itemToUpdate.idUtente)
            );

            // Stage 1
            this.cognomeCtrl.setValue(this.contatto.cognome);
            this.nomeCtrl.setValue(this.contatto.nome);
            this.titoloCtrl.setValue(this.contatto.idTitolo);

            const azienda = this.aziende.find(azienda => azienda.id === this.contatto!.idTerzaParte);
            if (azienda) this.aziendaCtrl.setValue(azienda);

            const ref = this.referenti.find(ref => ref.id === this.contatto!.idReferente);
            if (ref) this.referenteCtrl.setValue(ref);

            this.auguriCtrl.setValue(this.contatto.valido);

            // Stage 2
            this.telefonoCtrl.setValue(this.contatto.telefono);
            this.tecnoCodeCtrl.setValue(this.contatto.tecnoCode);
            this.cellulareCtrl.setValue(this.contatto.cellulare);
            this.emailCtrl.setValue(this.contatto.email);
            this.referenteClienteCtrl.setValue(this.contatto.referenteTerzaParte);

            this.indirizzi = await lastValueFrom(
                this.anagraficaService.prepareIndirizzo(this.contatto.idTerzaParte)
            );
            const indirizzo = this.indirizzi.find(indirizzo => indirizzo.descrizione === this.contatto!.indirizzo);
            if (indirizzo) this.indirizzoCtrl.setValue(indirizzo);

            this.cittaCtrl.setValue(this.contatto.comune);
            this.provinciaCtrl.setValue(this.contatto.denominazione);
            this.capCtrl.setValue(this.contatto.cap);
            this.noteCtrl.setValue(this.contatto.note);

            // Stage 3
            this.telefonoPrivataCtrl.setValue(this.contatto.telefonoPrivata);
            this.cellularePrivataCtrl.setValue(this.contatto.cellularePrivata);
            this.emailPrivataCtrl.setValue(this.contatto.emailPrivata);
            
            this.loading = false;

            this.stage1Form.markAllAsTouched();
            this.stage2Form.markAllAsTouched();
            this.stage3Form.markAllAsTouched();
        }
    }

    createUpdate() {
        if (this.itemToUpdate) this.update();
        else this.create();
    }

    async update() {

        if (!this.contatto || this.stage1Form.invalid || this.stage2Form.invalid || this.stage3Form.invalid) return;

        try {

            await lastValueFrom(
                this.anagraficaService.saveContatto({
                    idUtente: this.contatto.idUtente,
                    idTitolo: this.titoloCtrl.value!,
                    cognome: this.cognomeCtrl.value!,
                    nome: this.nomeCtrl.value!,
                    idTerzaParte: this.aziendaCtrl.value?.id!,
                    idReferente: this.referenteCtrl.value?.id!,
                    valido: this.auguriCtrl.value!,
                    tecnoCode: this.tecnoCodeCtrl.value,
                    telefono: this.telefonoCtrl.value,
                    cellulare: this.cellulareCtrl.value,
                    email: this.emailCtrl.value,
                    referenteTerzaParte: this.referenteClienteCtrl.value!,
                    indirizzo: this.indirizzoCtrl.value?.descrizione!,
                    comune: this.cittaCtrl.value,
                    cap: this.capCtrl.value,
                    note: this.noteCtrl.value,
                    telefonoPrivata: this.telefonoPrivataCtrl.value,
                    cellularePrivata: this.cellularePrivataCtrl.value,
                    emailPrivata: this.emailPrivataCtrl.value
                })
            );

            this.toaster.show("Contatto modificato con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la modifica del contatto. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }

    async create() {

        if (this.stage1Form.invalid || this.stage2Form.invalid || this.stage3Form.invalid) return;

        try {

            await lastValueFrom(
                this.anagraficaService.saveContatto({
                    idTitolo: this.titoloCtrl.value!,
                    cognome: this.cognomeCtrl.value!,
                    nome: this.nomeCtrl.value!,
                    idTerzaParte: this.aziendaCtrl.value?.id!,
                    idReferente: this.referenteCtrl.value?.id!,
                    valido: this.auguriCtrl.value!,
                    tecnoCode: this.tecnoCodeCtrl.value,
                    telefono: this.telefonoCtrl.value,
                    cellulare: this.cellulareCtrl.value,
                    email: this.emailCtrl.value,
                    referenteTerzaParte: this.referenteClienteCtrl.value!,
                    indirizzo: this.indirizzoCtrl.value?.descrizione!,
                    comune: this.cittaCtrl.value,
                    cap: this.capCtrl.value,
                    note: this.noteCtrl.value,
                    telefonoPrivata: this.telefonoPrivataCtrl.value,
                    cellularePrivata: this.cellularePrivataCtrl.value,
                    emailPrivata: this.emailPrivataCtrl.value
                })
            );

            this.toaster.show("Contatto creato con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la creazione del contatto. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }
}