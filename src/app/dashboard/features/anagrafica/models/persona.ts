import { PrepareObject } from "./prepare-object";

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

export interface Abilitazione {
    idAzienda: number;
    idProfilo: number;
    progressivo?: number | null;
    aziendaDelGruppo: string;
    profiliFunzioni: string;
    idLegame?: number | null;
    aziendaPreferita: boolean;
}

export interface Provincia {
    id?: number | null;
    descrizione: string;
    tipo?: string | null;
    code?: string | null;
    codice: string;
    codiceDescrizione: string;
}

export interface DettaglioPersona {
    idUtente: number | null;
    logo: {
        base64?: string | null;
        estensione?: string | null;
    };
    titolo: number;
    nome: number;
    cognome: number;
    dataDiNascita: string | null,
    provinciaDiNascita: Provincia,
    sesso: string;
    statoCivile: number | null,
    luogoNascita: string;
    nazionalita: string;
    codFiscale: string;
    titoloStudio: number;
    titoloStudioArea: number;
    indirizzo: string;
    citta: string | null;
    telefono: string;
    email: string;
    cap: string;
    provinciaDiResidenza: Provincia;
    cellulare: string;
    telefonoProfessionale: string;
    cellulareProfessionale: string;
    sedeLavoro: PrepareObject | null;
    badge: string;
    descrizioneSedeLavoro: string;
    technocode: string;
    emailProfessionale: string;
    fax: string;
    uuidWelcome: string;
    descrizioneUfficio: string;
    socioScai: boolean;
    datiRiservati: boolean;
    noteSocioScai: string;
    emailAziendaleIntranet: string;
    gruppo: string;
    abilitazioni: Abilitazione[];
    sign: {
        base64?: string | null;
        estensione?: string | null;
    };
}