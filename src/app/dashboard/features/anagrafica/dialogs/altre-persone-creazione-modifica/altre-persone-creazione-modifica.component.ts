import { Component, Input, OnInit } from "@angular/core";
import { Contatto, DettaglioContatto, SaveContattoParam } from "../../models/contatto";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PrepareObject } from "../../models/prepare-object";
import { combineLatest, lastValueFrom, map } from "rxjs";
import { AltrePersoneService } from "../../services/altre-persone.service";
import { cellulareRegExp, telefonoRegExp } from "src/app/utils/regex";
import { lookmap, singlifyLookmap } from "src/app/utils/object";
import { ToastService } from "src/app/services/toast.service";
import { SelectOption } from "src/app/shared/components/input/input.component";

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
    titoli: SelectOption[] = [];
    aziende: PrepareObject[] = [];
    referenti: PrepareObject[] = [];
    autoFormatter = (po: PrepareObject) => po.descrizione;

    form1 = new FormGroup({
        idTitolo: new FormControl(1),
        cognome: new FormControl("", [ Validators.required ]),
        nome: new FormControl("", [ Validators.required ]),
        azienda: new FormControl<PrepareObject | null>(null, [ Validators.required ]),
        referente: new FormControl<PrepareObject | null>(null, [ Validators.required ]),
        referenteTerzaParte: new FormControl<boolean>(false),
        valido: new FormControl<boolean>(false) // It's auguri... BLAME THE BE!
    });

    // Stage 2
    indirizzi: SelectOption[] = [];

    form2 = new FormGroup({
        tecnoCode: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        telefono: new FormControl("", [ Validators.pattern(telefonoRegExp) ]),
        cellulare: new FormControl("", [ Validators.pattern(cellulareRegExp) ]),
        email: new FormControl("", [ Validators.email ]),
        indirizzo: new FormControl<string | null>(null),
        citta: new FormControl(""),
        denominazione: new FormControl(""), // It's provincia... BLAME THE BE!
        cap: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        note: new FormControl("")
    });

    // Stage 3
    form3 = new FormGroup({
        telefonoPrivata: new FormControl("", [ Validators.pattern(telefonoRegExp) ]),
        cellularePrivata: new FormControl("", [ Validators.pattern(cellulareRegExp) ]),
        emailPrivata: new FormControl("", [ Validators.email ])
    });

    constructor(
        public activeModal: NgbActiveModal,
        private altrePersoneService: AltrePersoneService,
        private toaster: ToastService
    ) {}

    async ngOnInit() {

        this.loading = true;

        // Get autocomplete lists
        [ this.titoli, this.aziende, this.referenti ] = await lastValueFrom(
            combineLatest([
                this.altrePersoneService
                    .prepareTitoli()
                    .pipe(
                        map(titoli =>
                            titoli.map(({ id, descrizione }) =>
                                ({ value: id, text: descrizione })
                            )
                        )
                    ),
                this.altrePersoneService.prepareAziendeClientiTerzeParti(),
                this.altrePersoneService.prepareReferenti()
            ])
        );

        this.aziendaLookup = singlifyLookmap(lookmap("id", this.aziende));
        this.referenteLookup = singlifyLookmap(lookmap("id", this.referenti));

        this.loading = false;

        // Setup indirizzoCtrl reactivity (autopopulate citta, provincia and cap when possible)
        this.form2.controls["indirizzo"]
            .valueChanges
            .subscribe(async indirizzo => {

                const { citta, denominazione, cap } = this.form2.controls;

                if (!indirizzo) {
                    citta.reset();
                    denominazione.reset();
                    cap.reset();
                    return;
                }

                const indirizzoInfo = await lastValueFrom(
                    this.altrePersoneService.prepareIndirizzoInfo({
                        indirizzo,
                        idTerzaParte: this.form1.value.azienda?.id!,
                    })
                );

                if (!indirizzoInfo) return;

                citta.setValue(indirizzoInfo.comune);
                denominazione.setValue(indirizzoInfo.descProvincia);
                cap.setValue(indirizzoInfo.cap);
            });

        // Setup aziendaCtrl reactivity (get indirizzi, autopopulate indirizzo if possible)
        this.form1.controls["azienda"]
            .valueChanges
            .subscribe(async azienda => {

                const indirizzoCtrl = this.form2.controls["indirizzo"];

                if (!azienda) {
                    indirizzoCtrl.reset();
                    this.indirizzi = [];
                    return;
                }

                const indirizzi = await lastValueFrom(
                    this.altrePersoneService.prepareIndirizzo(azienda.id)
                );

                this.indirizzi = indirizzi
                    .map(({ descrizione: value }) => ({ value, text: value }));
                
                if (this.indirizzi.length === 1) {
                    indirizzoCtrl.setValue(this.indirizzi[0].value);
                }
            });

        // Populate fields from response
        if (this.itemToUpdate) {

            this.loading = true;

            this.contatto = await lastValueFrom(
                this.altrePersoneService
                    .dettaglioContatto(this.itemToUpdate.idUtente)
            );

            this.indirizzi = await lastValueFrom(
                this.altrePersoneService
                    .prepareIndirizzo(this.contatto.idTerzaParte)
                    .pipe(
                        map(indirizzi =>
                            indirizzi.map(({ descrizione: value }) =>
                                ({ value, text: value })
                            )
                        )
                    )
            );

            // Stage 1
            this.form1.patchValue({ ...this.contatto });

            const azienda = this.aziende
                .find(azienda => azienda.id === this.contatto!.idTerzaParte);
            if (azienda) {
                this.form1.controls["azienda"].setValue(azienda);
            }

            const ref = this.referenti
                .find(ref => ref.id === this.contatto!.idReferente);
            if (ref) {
                this.form1.controls["referente"].setValue(ref);
            }

            // Stage 2
            this.form2.patchValue({ ...this.contatto });

            const indirizzo = this.indirizzi
                .find(indirizzo => indirizzo.value === this.contatto!.indirizzo);
            if (indirizzo) {
                this.form2.controls["indirizzo"].setValue(indirizzo.value);
            }

            // Stage 3
            this.form3.patchValue({ ...this.contatto });
            
            this.loading = false;

            this.form1.markAllAsTouched();
            this.form2.markAllAsTouched();
            this.form3.markAllAsTouched();
        }
    }

    getRequest(idUtente: number | null = null) {

        const saveContattoParam: any =  {
            idUtente,
            ...this.form1.value,
            ...this.form2.value,
            ...this.form3.value
        };

        // Extract ids from objects
        saveContattoParam.idTerzaParte = saveContattoParam.azienda?.id!;
        saveContattoParam.idReferente = saveContattoParam.referente?.id!;

        // Delete objects to prevent problems
        delete saveContattoParam.azienda;
        delete saveContattoParam.referente;

        return saveContattoParam as SaveContattoParam;
    }

    createUpdate() {
        if (this.itemToUpdate) this.update();
        else this.create();
    }

    async update() {

        if (!this.contatto || this.form1.invalid || this.form2.invalid || this.form3.invalid) return;

        try {

            await lastValueFrom(
                this.altrePersoneService
                    .saveContatto(
                        this.getRequest(this.contatto.idUtente)
                    )
            );

            this.toaster.show("Contatto modificato con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la modifica del contatto. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }

    async create() {

        if (this.form1.invalid || this.form2.invalid || this.form3.invalid) return;

        try {

            await lastValueFrom(
                this.altrePersoneService
                    .saveContatto(
                        this.getRequest()
                    )
            );

            this.toaster.show("Contatto creato con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la creazione del contatto. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }
}