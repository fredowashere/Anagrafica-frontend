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
    
    collapsed: { [key: string]: boolean }= {
        professionali: false,
        personali: true,
        altro: true
    };

    titoli: SelectOption[] = [];
    aziende: PrepareObject[] = [];
    referenti: PrepareObject[] = [];
    autoFormatter = (po: PrepareObject) => po.descrizione;
    indirizzi: SelectOption[] = [];

    form = new FormGroup({

        idTitolo: new FormControl(1),
        cognome: new FormControl("", [ Validators.required ]),
        nome: new FormControl("", [ Validators.required ]),
        azienda: new FormControl<PrepareObject | null>(null, [ Validators.required ]),
        referente: new FormControl<PrepareObject | null>(null, [ Validators.required ]),
        referenteTerzaParte: new FormControl<boolean>(false),
        valido: new FormControl<boolean>(false), // It's auguri... BLAME THE BE!

        tecnoCode: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        telefono: new FormControl("", [ Validators.pattern(telefonoRegExp) ]),
        cellulare: new FormControl("", [ Validators.pattern(cellulareRegExp) ]),
        email: new FormControl("", [ Validators.email ]),
        indirizzo: new FormControl<string | null>(null),
        citta: new FormControl(""),
        denominazione: new FormControl(""), // It's provincia... BLAME THE BE!
        cap: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        note: new FormControl(""),

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

        // Open all collapse if not opened by default and readonly
        Object.keys(this.collapsed)
            .forEach(key =>
                this.collapsed[key] = (this.collapsed[key] === false)
                    ? false
                    : !this.readonlyItem
            );

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
        this.form.controls["indirizzo"]
            .valueChanges
            .subscribe(async indirizzo => {

                const { citta, denominazione, cap } = this.form.controls;

                if (!indirizzo) {
                    citta.reset();
                    denominazione.reset();
                    cap.reset();
                    return;
                }

                const indirizzoInfo = await lastValueFrom(
                    this.altrePersoneService.prepareIndirizzoInfo({
                        indirizzo,
                        idTerzaParte: this.form.value.azienda?.id!,
                    })
                );

                if (!indirizzoInfo) return;

                citta.setValue(indirizzoInfo.comune);
                denominazione.setValue(indirizzoInfo.descProvincia);
                cap.setValue(indirizzoInfo.cap);
            });

        // Setup aziendaCtrl reactivity (get indirizzi, autopopulate indirizzo if possible)
        this.form.controls["azienda"]
            .valueChanges
            .subscribe(async azienda => {

                const indirizzoCtrl = this.form.controls["indirizzo"];

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

            this.form.patchValue({ ...this.contatto });

            const azienda = this.aziende
                .find(azienda => azienda.id === this.contatto!.idTerzaParte);
            if (azienda) {
                this.form.controls["azienda"].setValue(azienda);
            }

            const ref = this.referenti
                .find(ref => ref.id === this.contatto!.idReferente);
            if (ref) {
                this.form.controls["referente"].setValue(ref);
            }

            const indirizzo = this.indirizzi
                .find(indirizzo => indirizzo.value === this.contatto!.indirizzo);
            if (indirizzo) {
                this.form.controls["indirizzo"].setValue(indirizzo.value);
            }
            
            this.loading = false;

            this.form.markAllAsTouched();
            this.form.markAllAsTouched();
            this.form.markAllAsTouched();
        }
    }

    getRequest(idUtente: number | null = null) {

        const saveContattoParam: any =  {
            idUtente,
            ...this.form.value
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

        if (!this.contatto || this.form.invalid) return;

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

        if (this.form.invalid || this.form.invalid) return;

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