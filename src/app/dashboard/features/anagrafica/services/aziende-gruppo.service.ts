import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { PrepareObject } from "../models/prepare-object";
import { Azienda, AziendeGruppoParam } from "../models/azienda";
import { Observable, map } from "rxjs";

//  █████╗ ███████╗██╗███████╗███╗   ██╗██████╗ ███████╗    ██████╗ ███████╗██╗          ██████╗ ██████╗ ██╗   ██╗██████╗ ██████╗  ██████╗ 
// ██╔══██╗╚══███╔╝██║██╔════╝████╗  ██║██╔══██╗██╔════╝    ██╔══██╗██╔════╝██║         ██╔════╝ ██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔═══██╗
// ███████║  ███╔╝ ██║█████╗  ██╔██╗ ██║██║  ██║█████╗      ██║  ██║█████╗  ██║         ██║  ███╗██████╔╝██║   ██║██████╔╝██████╔╝██║   ██║
// ██╔══██║ ███╔╝  ██║██╔══╝  ██║╚██╗██║██║  ██║██╔══╝      ██║  ██║██╔══╝  ██║         ██║   ██║██╔══██╗██║   ██║██╔═══╝ ██╔═══╝ ██║   ██║
// ██║  ██║███████╗██║███████╗██║ ╚████║██████╔╝███████╗    ██████╔╝███████╗███████╗    ╚██████╔╝██║  ██║╚██████╔╝██║     ██║     ╚██████╔╝
// ╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝    ╚═════╝ ╚══════╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝      ╚═════╝ 

@Injectable({
    providedIn: 'root'
})
export class AziendeGruppoService {

    constructor(
        private http: HttpClient
    ) { }

    aziendeGruppo(filter: AziendeGruppoParam): Observable<Azienda[]> {

        const url = `${environment.scaiRoot}/anagrafica-service/aziendeGruppo/filteredSearch`;

        return this.http.post<any>(url, filter)
        .pipe(
            map(response =>
                response.map((azienda: any) => ({
                    descrizione: azienda.descrizione,
                    idAzienda: azienda.idAzienda,
                    valido: azienda.valido
                }))
            )
        );
    }

    prepareRagioniSociali() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareRagioniSociali`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareTipologieContratto() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareTipologieContratto`;
        return this.http.get<PrepareObject[]>(url);
    }

    prepareSettoriMerceologici() {
        const url = `${environment.scaiRoot}/anagrafica-service/prepareSettoriMerceologici`;
        return this.http.get<PrepareObject[]>(url);
    }
}