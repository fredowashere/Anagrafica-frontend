export interface TerzePartiSearchParam {
    descrizione?: string;
    idBu?: number;
    idTipoTerzeParti?: number;
    idSettoreMerceologico?: number;
    idRagioneSociale?: number;
    idAziendaGruppo?: number;
    partitaIva?: string;
}

export interface Cliente {
    id: number;
    descrizione: string;
}