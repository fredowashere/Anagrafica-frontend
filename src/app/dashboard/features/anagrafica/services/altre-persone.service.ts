import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AltrePersoneParam, Contatto, DettaglioContatto, SaveContattoParam } from "../models/contatto";
import { Observable, map } from "rxjs";
import { environment } from "src/environments/environment";
import { PrepareObject } from "../models/prepare-object";
import { IndirizzoInfo } from "../models/indirizzo";

//  █████╗ ██╗  ████████╗██████╗ ███████╗    ██████╗ ███████╗██████╗ ███████╗ ██████╗ ███╗   ██╗███████╗
// ██╔══██╗██║  ╚══██╔══╝██╔══██╗██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║██╔════╝
// ███████║██║     ██║   ██████╔╝█████╗      ██████╔╝█████╗  ██████╔╝███████╗██║   ██║██╔██╗ ██║█████╗  
// ██╔══██║██║     ██║   ██╔══██╗██╔══╝      ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║██║   ██║██║╚██╗██║██╔══╝  
// ██║  ██║███████╗██║   ██║  ██║███████╗    ██║     ███████╗██║  ██║███████║╚██████╔╝██║ ╚████║███████╗
// ╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   

@Injectable({
    providedIn: 'root'
})
export class AltrePersoneService {

    constructor(
        private http: HttpClient
    ) { }
                                                                                                       
    altrePersone(filter: AltrePersoneParam): Observable<Contatto[]> {
    
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/ricercaAltrePersone`;
    
      return this.http.post<any>(url, filter)
        .pipe(
          map(response => {
    
            if (!response.risultati) return [];
    
            // The response is full of garbage, let's clean it!
            if (Array.isArray(response.risultati)) {
              return response.risultati.map((utente: any) => ({
                cognome: utente.cognome,
                nome: utente.nome,
                idUtente: utente.idUtente
              }));
            }
    
            return [];
          })
        );
    }
    
    prepareReferenti() {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/prepareReferenti`;
      return this.http.get<PrepareObject[]>(url);
    }
    
    prepareTitoli() {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/prepareTitoli`;
      return this.http.get<PrepareObject[]>(url);
    }
    
    prepareAziendeClientiTerzeParti() {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/prepareAziendeClientiTerzeParti?snippet=`;
      return this.http.get<PrepareObject[]>(url);
    }
    
    prepareIndirizzo(idTerzaParte: number) {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/prepareIndirizzo`;
      return this.http.post<PrepareObject[]>(url, idTerzaParte);
    }
    
    prepareIndirizzoInfo(indirizzo: { idTerzaParte: number, indirizzo: string }) {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/prepareIndirizzoInfo`;
      return this.http.post<IndirizzoInfo>(url, indirizzo);
    }
    
    dettaglioContatto(idUtente: number) {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/dettaglioContatto`;
      return this.http.post<DettaglioContatto>(url, idUtente);
    }
    
    eliminaContatto(idUtente: number) {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/eliminaContatto`;
      return this.http.post(url, idUtente);
    }
    
    saveContatto(contatto: SaveContattoParam) {
      const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/saveContatto`;
      return this.http.post(url, contatto);
    }
}
