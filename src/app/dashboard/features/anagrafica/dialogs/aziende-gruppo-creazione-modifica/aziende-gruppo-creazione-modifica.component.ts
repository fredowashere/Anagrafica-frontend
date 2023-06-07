import { Component, Input, OnInit } from "@angular/core";
import { Contatto } from "../../models/contatto";
import { FormGroup } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PrepareObject } from "../../models/prepare-object";
import { lastValueFrom } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { AziendeGruppoService } from "../../services/aziende-gruppo.service";

@Component({
    standalone: true,
    imports: [ CommonModule, SharedModule ],
    templateUrl: "./aziende-gruppo-creazione-modifica.component.html",
    styleUrls: [ "./aziende-gruppo-creazione-modifica.component.css" ]
})
export class AziendaGruppoCreazioneModifica implements OnInit {

    @Input("itemToUpdate") itemToUpdate?: Contatto;
    @Input("readonlyItem") readonlyItem = false;
    azienda?: any;
    aziendaLookup: { [key: number]: PrepareObject | undefined } = {};
    referenteLookup: { [key: number]: PrepareObject | undefined } = {};
    loading = false;

    // Stage 1

    stage1Form = new FormGroup({});

    // Stage 2

    stage2Form = new FormGroup({});

    // Stage 3

    stage3Form = new FormGroup({});

    constructor(
        public activeModal: NgbActiveModal,
        private aziendeGruppoService: AziendeGruppoService,
        private toaster: ToastService
    ) {}

    async ngOnInit() {

        this.loading = true;

        this.loading = false;

        

        // Populate fields from response
        if (this.itemToUpdate) {

            this.loading = true;

            
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

        if (!this.azienda || this.stage1Form.invalid || this.stage2Form.invalid || this.stage3Form.invalid) return;

        try {

            // await lastValueFrom(

            // );

            this.toaster.show("Azienda modificata con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la modifica dell'azienda. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }

    async create() {

        if (this.stage1Form.invalid || this.stage2Form.invalid || this.stage3Form.invalid) return;

        try {

            // await lastValueFrom(

            // );

            this.toaster.show("Azienda creata con successo!", { classname: "bg-success text-light" });
            this.activeModal.close();
        }
        catch(ex) {
            this.toaster.show("Si è verificato un errore durante la creazione dell'azienda. Contattare il supporto tecnico.", { classname: "bg-danger text-light" });
        }
    }
}