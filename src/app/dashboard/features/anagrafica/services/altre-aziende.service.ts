import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable, map } from "rxjs";
import { Cliente, TerzePartiSearchParam } from "../models/cliente";
import { AuthService } from "src/app/services/auth.service";
import { SearchFilters } from "../models/prepare-object";

//  █████╗ ██╗  ████████╗██████╗ ███████╗     █████╗ ███████╗██╗███████╗███╗   ██╗██████╗ ███████╗
// ██╔══██╗██║  ╚══██╔══╝██╔══██╗██╔════╝    ██╔══██╗╚══███╔╝██║██╔════╝████╗  ██║██╔══██╗██╔════╝
// ███████║██║     ██║   ██████╔╝█████╗      ███████║  ███╔╝ ██║█████╗  ██╔██╗ ██║██║  ██║█████╗  
// ██╔══██║██║     ██║   ██╔══██╗██╔══╝      ██╔══██║ ███╔╝  ██║██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  
// ██║  ██║███████╗██║   ██║  ██║███████╗    ██║  ██║███████╗██║███████╗██║ ╚████║██████╔╝███████╗
    // ╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝

@Injectable({
    providedIn: 'root'
})
export class AltreAziendeService {

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) { }

    terzePartiSearch(filter: TerzePartiSearchParam): Observable<Cliente[]> {
        
        const url = `${environment.scaiRoot}/anagrafica-service/terzeParti/search`;
        const { idAzienda } = this.authService.user;

        // Force the endpoint to give me ALL the data
        const params = new HttpParams()
            .set("idAziendaSelezionata", idAzienda!)
            .set("page", 1)
            .set("size", 10000)
            .set("filters", JSON.stringify(filter));

        return this.http.get<any>(url, { params })
        .pipe(
            map(response => {
                if (!response.risultati) return [];
                if (Array.isArray(response.risultati)) return response.risultati;
                return [];
            })
        );
    }

    terzePartiPrepareSearchFilters() {
        const { idAzienda } = this.authService.user;
        const url = `${environment.scaiRoot}/anagrafica-service/terzeParti/prepareSearchFilters?idAziendaSelezionata=${idAzienda}`;
        return this.http.get<SearchFilters>(url);
    }
}