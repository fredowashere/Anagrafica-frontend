export interface AltrePersoneParam {
    nome?: string;
    cognome?: string;
    auguriValido?: number;
    idReferente?: number;
    idTerzaParte?: number;
}

export interface Contatto {
    nome: string;
    cognome: string;
    idUtente: number;
}

export interface DettaglioContatto {
    idUtente?: number;
    nome: string;
    cognome: string;
    idTerzaParte: number;
    idReferente: number;
    valido: boolean;
    referenteTerzaParte: boolean;
    tecnoCode: string | null;
    cellulare: string | null;
    telefono: string | null;
    email: string | null;
    note: string | null;
    indirizzo: string | null;
    cap: string | null;
    comune: string | null;
    codiceProvincia: string | null;
    denominazione: string | null;
    cellularePrivata: string | null;
    telefonoPrivata: string | null;
    emailPrivata: string | null;
    idTitolo: number;
    descrizioneTitolo: string;
}

export interface SaveContattoParam {
    idUtente?: number | null,
    idTitolo: number,
    cognome: string;
    nome: string;
    idTerzaParte: number,
    idReferente: number,
    valido: boolean;
    tecnoCode?: string | null;
    telefono?: string | null;
    cellulare?: string | null;
    email?: string | null;
    referenteTerzaParte: boolean;
    indirizzo?: string | null;
    comune?: string | null;
    cap?: string | null;
    note?: string | null;
    telefonoPrivata?: string | null;
    cellularePrivata?: string | null;
    emailPrivata?: string | null;
}

