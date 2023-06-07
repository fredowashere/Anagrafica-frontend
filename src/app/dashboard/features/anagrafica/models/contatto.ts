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
    idUtente: number;
    nome: string;
    cognome: string;
    idTerzaParte: number;
    idReferente: number;
    valido: boolean;
    referenteTerzaParte: boolean;
    tecnoCode: string;
    cellulare: string;
    telefono: string;
    email: string;
    note: string;
    indirizzo: string;
    cap: string;
    comune: string;
    codiceProvincia: string;
    denominazione: string;
    cellularePrivata: string;
    telefonoPrivata: string;
    emailPrivata: string;
    idTitolo: number;
    descrizioneTitolo: string;
}