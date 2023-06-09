import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Abilitazione, DettaglioPersona, FindPersonParam, Person } from "../models/persona";
import { environment } from "src/environments/environment";
import { AuthService } from "src/app/services/auth.service";
import { PrepareObject } from "../models/prepare-object";
import { map } from "rxjs";
import { MiscDataService } from "../../commons/services/miscellaneous-data.service";

// ██████╗ ███████╗██████╗ ███████╗ ██████╗ ███╗   ██╗███████╗    ██╗███╗   ██╗     ██████╗ ██████╗  ██████╗  █████╗ ███╗   ██╗██╗ ██████╗ ██████╗ 
// ██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║██╔════╝    ██║████╗  ██║    ██╔═══██╗██╔══██╗██╔════╝ ██╔══██╗████╗  ██║██║██╔════╝██╔═══██╗
// ██████╔╝█████╗  ██████╔╝███████╗██║   ██║██╔██╗ ██║█████╗      ██║██╔██╗ ██║    ██║   ██║██████╔╝██║  ███╗███████║██╔██╗ ██║██║██║     ██║   ██║
// ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║██║   ██║██║╚██╗██║██╔══╝      ██║██║╚██╗██║    ██║   ██║██╔══██╗██║   ██║██╔══██║██║╚██╗██║██║██║     ██║   ██║
// ██║     ███████╗██║  ██║███████║╚██████╔╝██║ ╚████║███████╗    ██║██║ ╚████║    ╚██████╔╝██║  ██║╚██████╔╝██║  ██║██║ ╚████║██║╚██████╗╚██████╔╝
// ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚═╝╚═╝  ╚═══╝     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═════╝  

@Injectable({
    providedIn: 'root'
})
export class PersoneOrganicoService {

    constructor(
        private authService: AuthService,
        private miscData: MiscDataService,
        private http: HttpClient
    ) { }

    findPerson(filter: FindPersonParam) {

        const url = `${environment.scaiRoot}/anagrafica-service/findPerson`;
        const { idAzienda } = this.authService.user;

        // Force the endpoint to give me ALL the data
        Object.assign(filter, {
            idAzienda,
            aziendaSelezionata: {
                id: idAzienda,
                admin: true,
                profiloAdmin: true,
                idProfilo: Array(200).fill(0).map((_, i) => i + 1)
            }
        });

        return this.http.post<Person[]>(url, filter);
    }

    getUtenteAnagraficaById(idUtente: number) {
        const url = `${environment.scaiRoot}/anagrafica-service/getUtenteAnagraficaById?idUtente=${idUtente}`;
        return this.http.get<DettaglioPersona>(url);
    }

    prepareBusinessUnit() {
        const { idAzienda } = this.authService.user;
        const url = `${environment.scaiRoot}/anagrafica-service/prepareBusinessUnit?idAziendaSelezionata=${idAzienda}`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareTipiUtente() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareTipiUtente`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareTitoliInsertPerson() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareTitoliInsertPerson`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareProvince() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareProvince`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareStatoCivile() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareStatoCivile`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareTitoliStudio() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareTitoliStudio`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareTitoliStudioArea(idTitoloDiStudio: number) {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareTitoliStudioArea?idTitoloDiStudio=${idTitoloDiStudio}`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareProfiloFunzioni() {
        const url = `${environment.scaiRoot}/anagrafica-service/pepareProfiloFunzioni`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareAbilitazioni() {

        const { idAzienda } = this.authService.user;
        const { descrizione } = this.miscData.idAziendaAzienda[idAzienda!]!;

        // Passing aziendaDescr to get it back as aziendaDelGruppo is dumb beyond belief!
        const params = new HttpParams()
            .set("idAzienda", idAzienda!)
            .set("aziendaDescr", descrizione!);
        
        const url = `${environment.scaiRoot}/anagrafica-service/prepareAbilitazioni`;
        
        return this.http.get<Abilitazione[]>(url, { params });
    }
}