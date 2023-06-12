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
import { Abilitazione, DettaglioPersona, Persona, Provincia } from "../../models/persona";
import { AziendaInfo, MiscDataService } from "../../../commons/services/miscellaneous-data.service";
import { AuthService } from "src/app/services/auth.service";
import { cellulareRegExp, telefonoRegExp } from "src/app/utils/regex";

@Component({
    standalone: true,
    imports: [ CommonModule, SharedModule ],
    templateUrl: "./persone-organico-creazione-modifica.component.html",
    styleUrls: [ "./persone-organico-creazione-modifica.component.css" ]
})
export class PersoneOrganicoCreazioneModifica implements OnInit {

    @Input("itemToUpdate") itemToUpdate?: Persona;
    @Input("readonlyItem") readonlyItem = false;
    persona?: DettaglioPersona;
    loading = false;

    booleans = [
        { value: false, text: "No" },
        { value: true, text: "Si" }
    ];

    collapsed: { [key: string]: boolean } = {
        contatti: false,
        residenza: true,
        istruzione: true,
        altro: true,
        contattiProfessionali: false,
        note: true
    }

    // Stage 1
    titoli: SelectOption[] = [];
    generiBiologici = [
        { value: "M", text: "Maschio" },
        { value: "F", text: "Femmina" }
    ];
    statiCivili: SelectOption[] = [];
    titoliStudio: SelectOption[] = [];
    materieStudio: SelectOption[] = [];
    province: Provincia[] = [];
    autoFormatter = (obj: any) => obj.descrizione;

    form1 = new FormGroup({
        titolo: new FormControl(1),
        cognome: new FormControl("", [ Validators.required ]),
        nome: new FormControl("", [ Validators.required ]),
        sesso: new FormControl("M", [ Validators.required ]),
        dataDiNascita: new FormControl(""),
        luogoNascita: new FormControl(""),
        provinciaDiNascita: new FormControl<Provincia | null>(null),
        nazionalita: new FormControl(""),
        codFiscale: new FormControl("", [ Validators.pattern(/^[a-zA-Z0-9]{16}$/) ]),
        titoloStudio: new FormControl<number | null>(null),
        titoloStudioArea: new FormControl<number | null>(null),
        indirizzo: new FormControl(""),
        cap: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        citta: new FormControl(""),
        provinciaDiResidenza: new FormControl<Provincia | null>(null),
        telefono: new FormControl("", [ Validators.pattern(telefonoRegExp) ]),
        cellulare: new FormControl("", [ Validators.pattern(cellulareRegExp) ]),
        email: new FormControl("", [ Validators.email ]),
        emailProfessionale: new FormControl("", [ Validators.email ]),
        statoCivile: new FormControl<number | null>(null),
        socioScai: new FormControl<boolean>(false),
        datiRiservati: new FormControl<boolean>(false)
    });

    // Stage 2
    form2 = new FormGroup({
        technocode: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        uuidWelcome: new FormControl(""),
        badge: new FormControl("", [ Validators.pattern(/^\d+$/) ]),
        gruppo: new FormControl(""),
        telefonoProfessionale: new FormControl("", [ Validators.pattern(telefonoRegExp) ]),
        fax: new FormControl("", [ Validators.pattern(telefonoRegExp) ]),
        cellulareProfessionale: new FormControl("", [ Validators.pattern(cellulareRegExp) ]),
        emailAziendaleIntranet: new FormControl("", [ Validators.email ]),
        descrizioneSedeLavoro: new FormControl(""),
        descrizioneUfficio: new FormControl(""),
        noteSocioScai: new FormControl("")
    });

    // Stage 3
    profili: PrepareObject[] = [];
    abilitazioni: Abilitazione[] = [];

    form3 = new FormGroup({
        azienda: new FormControl<AziendaInfo | null>(null, [ Validators.required ]),
        profilo: new FormControl<PrepareObject | null>(null, [ Validators.required ])
    });

    constructor(
        public activeModal: NgbActiveModal,
        public miscData: MiscDataService,
        private authService: AuthService,
        private personeOrganicoService: PersoneOrganicoService,
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

        const prepare2Option = (objects: PrepareObject[]) =>
            objects.map(({ id, descrizione }) =>
                ({ value: id, text: descrizione })
            );

        [ 
            this.titoli,
            this.statiCivili,
            this.titoliStudio,
            this.province,
            this.profili,
            this.abilitazioni
        ] = await lastValueFrom(
            combineLatest([
                this.personeOrganicoService
                    .prepareTitoliInsertPerson()
                    .pipe(map(prepare2Option)),
                this.personeOrganicoService
                    .prepareStatoCivile()
                    .pipe(map(prepare2Option)),
                this.personeOrganicoService
                    .prepareTitoliStudio()
                    .pipe(map(prepare2Option)),
                this.personeOrganicoService.prepareProvince(),
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
            .subscribe(async idTitolo => {

                this.form1.controls["titoloStudioArea"].reset();

                if (idTitolo) {
                    this.materieStudio = await lastValueFrom(
                        this.personeOrganicoService
                            .prepareTitoliStudioArea(idTitolo)
                            .pipe(map(prepare2Option))
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

            this.abilitazioni.unshift(...abilitazioniPersona);

            // Stage 1
            this.form1.patchValue({ ...this.persona });

            // Stage 2
            this.form2.patchValue({ ...this.persona });
            
            this.loading = false;

            this.form1.markAllAsTouched();
            this.form2.markAllAsTouched();
        }
    }

    getRequest(idUtente: number | null = null) {

        const dettaglioPersona: any = {
            idUtente,
            ...this.form1.value,
            ...this.form2.value,
            abilitazioni: this.abilitazioni,
            logo: {},
            sign: {}
        };

        // God only knows why sedeLavoro must be passed in creation
        // but it doesn't persist on the resource
        if (idUtente) {
            dettaglioPersona.sedeLavoro = null;
        }
        else {
            dettaglioPersona.sedeLavoro = {
                id: this.authService.user.idAzienda,
                descrizione: null,
                tipo: null,
                code: null
            };
        }

        return dettaglioPersona as DettaglioPersona;
    }

    createUpdate() {
        if (this.itemToUpdate) this.update();
        else this.create();
    }

    async update() {

        if (!this.persona || this.form1.invalid || this.form2.invalid) return;

        try {

            await lastValueFrom(
                this.personeOrganicoService
                    .salvaModificaInserimento(
                        this.getRequest(this.persona.idUtente)
                    )
            );

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

            await lastValueFrom(
                this.personeOrganicoService
                .salvaModificaInserimento(
                    this.getRequest()
                )
            );

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

        const idAziendaidProfiloAbilitazione = this.abilitazioni
            .reduce((abilMap, abil) =>
                (abilMap[abil.idAzienda + ";" + abil.idProfilo] = abil, abilMap),
                {} as { [key: string]: Abilitazione }
            );

        if (idAziendaidProfiloAbilitazione[azienda.idAzienda + ";" + profilo.id]) {
            this.toaster.show("L'abilitazione scelta è già presente.", { classname: "bg-danger text-light" });
            return;
        }

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