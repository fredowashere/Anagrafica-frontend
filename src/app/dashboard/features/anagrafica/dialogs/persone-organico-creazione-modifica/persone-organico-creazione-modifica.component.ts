import { Component, Input, OnInit } from "@angular/core";
import { Contatto } from "../../models/contatto";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PrepareObject } from "../../models/prepare-object";
import { lastValueFrom } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { PersoneOrganicoService } from "../../services/persone-organico.service";

@Component({
    standalone: true,
    imports: [ CommonModule, SharedModule ],
    templateUrl: "./persone-organico-creazione-modifica.component.html",
    styleUrls: [ "./persone-organico-creazione-modifica.component.css" ]
})
export class PersoneOrganicoCreazioneModifica implements OnInit {

    @Input("itemToUpdate") itemToUpdate?: Contatto;
    @Input("readonlyItem") readonlyItem = false;
    persona?: any;
    aziendaLookup: { [key: number]: PrepareObject | undefined } = {};
    referenteLookup: { [key: number]: PrepareObject | undefined } = {};
    loading = false;

    // Stage 1
    titoli: { value: number, text: string }[] = [];
    generiBiologici = [];
    statiCivili = [];
    titoliStudio = [];
    materieStudio = [];

    form1 = new FormGroup({

        cognome: new FormControl("", [ Validators.required ]),
        nome: new FormControl("", [ Validators.required ]),
        titolo: new FormControl(1),
        dataNascita: new FormControl(),
        luogoNascita: new FormControl(),
        provinciaNascita: new FormControl(),
        nazionalita: new FormControl(),
        genereBiologico: new FormControl(),
        codiceFiscale: new FormControl(),
        statoCivile: new FormControl(),
        titoloStudio: new FormControl(),
        materiaStudio: new FormControl(),

        indirizzo: new FormControl(),
        cap: new FormControl(),
        citta: new FormControl(),
        provinciaResidenza: new FormControl(),

        telefono: new FormControl(),
        cellulare: new FormControl(),
        email: new FormControl(),
    });

    // Stage 2

    form2 = new FormGroup({});

    // Stage 3

    form3 = new FormGroup({});

    constructor(
        public activeModal: NgbActiveModal,
        private personeOrganicoService: PersoneOrganicoService,
        private toaster: ToastService
    ) {}

    async ngOnInit() {

        this.loading = true;

        this.loading = false;

        

        // Populate fields from response
        if (this.itemToUpdate) {

            this.loading = true;

            
            this.loading = false;

            this.form1.markAllAsTouched();
            this.form2.markAllAsTouched();
            this.form3.markAllAsTouched();
        }
    }

    createUpdate() {
        if (this.itemToUpdate) this.update();
        else this.create();
    }

    async update() {

        if (!this.persona || this.form1.invalid || this.form2.invalid || this.form3.invalid) return;

        try {

            // await lastValueFrom(

            // );

            this.toaster.show("Persona modificata con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la modifica della persona. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }

    async create() {

        if (this.form1.invalid || this.form2.invalid || this.form3.invalid) return;

        try {

            // await lastValueFrom(

            // );

            this.toaster.show("Persona creata con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la creazione della persona. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }
}