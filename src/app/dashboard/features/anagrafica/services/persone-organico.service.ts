import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FindPersonParam, Person } from "../models/persona";
import { environment } from "src/environments/environment";
import { AuthService } from "src/app/services/auth.service";
import { PrepareObject } from "../models/prepare-object";

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

    prepareBusinessUnit() {

        const url = `${environment.scaiRoot}/anagrafica-service/prepareBusinessUnit`;
        const { idAzienda } = this.authService.user;

        const params = new HttpParams()
            .set("idAziendaSelezionata", idAzienda + "");

        return this.http.get<PrepareObject[]>(url, { params: params });
    }

    prepareTipiUtente() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareTipiUtente`;
        return this.http.get<PrepareObject[]>(url);
    }
}