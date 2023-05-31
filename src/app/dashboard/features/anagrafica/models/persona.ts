export interface FindPersonParam {
    nome?: string;
    cognome?: string;
    numeroBadge?: string;
    idBusinessUnit?: number;
    idTipologia?: number;
    idUtente?: number;
}

export interface Person {
    nome: string;
    cognome: string;
    idUtente: number;
    controlloPerReferente: boolean;
    autenticabile: boolean;
}