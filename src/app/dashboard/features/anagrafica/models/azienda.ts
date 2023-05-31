export interface AziendeGruppoParam {
    descrizione?: string;
    idRagioneSociale?: number;
    idSettoreMerceologico?: number;
    idTipologiaContratto?: number;
}

export interface Azienda {
    descrizione: string;
    idAzienda: number;
    valido: boolean;
}