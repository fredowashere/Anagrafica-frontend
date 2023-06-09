import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PrepareObject } from "../../models/prepare-object";
import { combineLatest, lastValueFrom, map } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { PersoneOrganicoService } from "../../services/persone-organico.service";
import { SelectOption } from "src/app/shared/components/input/input.component";
import { Abilitazione, DettaglioPersona, Person } from "../../models/persona";
import { AziendaInfo, MiscDataService } from "../../../commons/services/miscellaneous-data.service";

@Component({
    standalone: true,
    imports: [ CommonModule, SharedModule ],
    templateUrl: "./persone-organico-creazione-modifica.component.html",
    styleUrls: [ "./persone-organico-creazione-modifica.component.css" ]
})
export class PersoneOrganicoCreazioneModifica implements OnInit {

    @Input("itemToUpdate") itemToUpdate?: Person;
    @Input("readonlyItem") readonlyItem = false;
    persona?: DettaglioPersona;
    loading = false;

    booleans = [
        { value: false, text: "No" },
        { value: true, text: "Si" }
    ];

    // Stage 1
    istruzioneCollapsed = !this.readonlyItem;
    residenzaCollapsed = !this.readonlyItem;
    contattiCollapsed = !this.readonlyItem;
    altroCollapsed = !this.readonlyItem;

    titoli: SelectOption[] = [];
    generiBiologici = [
        { value: "M", text: "Maschio" },
        { value: "F", text: "Femmina" }
    ];
    statiCivili: SelectOption[] = [];
    titoliStudio: PrepareObject[] = [];
    materieStudio: PrepareObject[] = [];
    autoFormatter = (obj: any) => obj.descrizione;

    form1 = new FormGroup({

        titolo: new FormControl(1),
        cognome: new FormControl("", [ Validators.required ]),
        nome: new FormControl("", [ Validators.required ]),
        genereBiologico: new FormControl("M", [ Validators.required ]),
        dataNascita: new FormControl(),
        luogoNascita: new FormControl(),
        provinciaNascita: new FormControl(),
        nazionalita: new FormControl(),
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
        socioScai: new FormControl<boolean>(false),
        datiRiservati: new FormControl<boolean>(false)
    });

    // Stage 2
    contattiProfessionaliCollapse = !this.readonlyItem;
    noteCollapsed = !this.readonlyItem;

    form2 = new FormGroup({

        tecnoCode: new FormControl(),
        uuidWelcome: new FormControl(),
        numeroBadge: new FormControl(),
        gruppo: new FormControl(),

        telefono: new FormControl(),
        fax: new FormControl(),
        cellulare: new FormControl(),
        emailAziendale: new FormControl(),

        descrizioneSedeLavoro: new FormControl(),
        descrizioneUfficio: new FormControl(),

        note: new FormControl()
    });

    // Stage 3
    aziende: AziendaInfo[] = [];
    profili: PrepareObject[] = [];
    abilitazioni: Abilitazione[] = [];

    form3 = new FormGroup({
        azienda: new FormControl<AziendaInfo | null>(null, [ Validators.required ]),
        profilo: new FormControl<PrepareObject | null>(null, [ Validators.required ])
    });

    constructor(
        public activeModal: NgbActiveModal,
        private miscData: MiscDataService,
        private personeOrganicoService: PersoneOrganicoService,
        private toaster: ToastService
    ) {}

    async ngOnInit() {

        this.aziende = this.miscData.aziende;

        this.loading = true;

        [ 
            this.titoli,
            this.statiCivili,
            this.titoliStudio,
            this.profili,
            this.abilitazioni
        ] = await lastValueFrom(
            combineLatest([
                this.personeOrganicoService
                    .prepareTitoliInsertPerson()
                    .pipe(
                        map(titoli =>
                            titoli.map(({ id, descrizione }) =>
                                ({ value: id, text: descrizione })
                            )
                        )
                    ),
                this.personeOrganicoService
                    .prepareStatoCivile()
                    .pipe(
                        map(statoCivile =>
                            statoCivile.map(({ id, descrizione }) =>
                                ({ value: id, text: descrizione })
                            )
                        )
                    ),
                this.personeOrganicoService.prepareTitoliStudio(),
                this.personeOrganicoService.prepareProfiloFunzioni(),
                this.personeOrganicoService.prepareAbilitazioni()
                    .pipe(
                        map(abilitazioni =>
                            abilitazioni.map(abilitazione => ({
                                ...abilitazione,
                                default: true
                            }))
                        )
                    )
            ])
        );

        this.loading = false;

        this.form1.controls["titoloStudio"]
            .valueChanges
            .subscribe(async titoloStudio => {

                this.form1.controls["materiaStudio"].reset();

                if (titoloStudio) {
                    this.materieStudio = await lastValueFrom(
                        this.personeOrganicoService
                            .prepareTitoliStudioArea(titoloStudio.id)
                    );
                }
            });

        // Populate fields from response
        if (this.itemToUpdate) {

            this.loading = true;

            this.persona = await lastValueFrom(
                this.personeOrganicoService
                    .getUtenteAnagraficaById(this.itemToUpdate.idUtente)
            );

            // Filter out abilitazioni default from abilitazioni persona
            const abilitazioniPersona = this.persona.abilitazioni
                .filter(a =>
                    !this.abilitazioni
                        .some(b =>
                            a.idAzienda === b.idAzienda
                         && a.idProfilo === b.idProfilo
                        )
                )
                .map(abilitazione => ({ ...abilitazione, default: false }));

            this.abilitazioni.push(...abilitazioniPersona);
            
            this.loading = false;

            this.form1.markAllAsTouched();
            this.form2.markAllAsTouched();
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

    addProfilo() {

        const { azienda, profilo } = this.form3.value;
        
        if (!azienda || !profilo) return;

        this.abilitazioni.unshift({
            aziendaDelGruppo: azienda.descrizione,
            idAzienda: azienda.idAzienda,
            idProfilo: profilo.id,
            profiliFunzioni: profilo.descrizione,
            aziendaPreferita: true,
            idLegame: null,
            progressivo: null,
            default: false
        });

        this.abilitazioni = [ ...this.abilitazioni ];

        this.form3.reset();
    }

    deleteProfilo(a: Abilitazione) {

        const idx = this.abilitazioni
            .findIndex(b =>
                b.idAzienda === a.idAzienda
             && b.idProfilo === a.idProfilo
            );

        this.abilitazioni.splice(idx, 1);

        this.abilitazioni = [ ...this.abilitazioni ];
    }
}