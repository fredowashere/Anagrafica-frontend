import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FindPersonParam, Person } from '../models/persona';
import { AuthService } from 'src/app/services/auth.service';
import { AltrePersoneParam, Contatto } from '../models/contatto';
import { Observable, map } from 'rxjs';
import { Azienda, AziendeGruppoParam } from '../models/azienda';
import { Cliente, TerzePartiSearchParam } from '../models/cliente';

@Injectable({
  providedIn: 'root'
})
export class AnagraficaService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  findPerson(filter: FindPersonParam) {

    const url = `${environment.scaiRoot}/anagrafica-service/findPerson`;

    // Force the endpoint to give me ALL the data
    const { idAzienda } = this.authService.user;
    const _filter = filter as any;
    _filter.idAzienda = idAzienda;
    _filter.aziendaSelezionata = {
      id: idAzienda,
      admin: true,
      profiloAdmin: true,
      idProfilo: Array(200).fill(0).map((_, i) => i + 1)
    };

    return this.http.post<Person[]>(url, filter);
  }

  altrePersone(filter: AltrePersoneParam): Observable<Contatto[]> {

    const url = `${environment.scaiRoot}/anagrafica-service/altrePersone/ricercaAltrePersone`;

    return this.http.post<any>(url, filter)
      .pipe(
        map(response => {

          if (!response.risultati) return [];

          // The response is full of garbage, let's clean it
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

  terzePartiSearch(filter: TerzePartiSearchParam): Observable<Cliente[]> {
    
    const url = `${environment.scaiRoot}/anagrafica-service/terzeParti/search`;

    const { idAzienda } = this.authService.user;

    const params = new HttpParams()
      .set("idAziendaSelezionata", idAzienda!)
      .set("page", 1)
      .set("size", 10000)
      .set("filters", JSON.stringify(filter));

    return this.http.get<any>(url, { params })
      .pipe(
        map(response => {

          if (!response.risultati) return [];

          // The response is full of garbage, let's clean it
          if (Array.isArray(response.risultati)) {
            return response.risultati;
          }

          return [];
        })
      );
  }
}
