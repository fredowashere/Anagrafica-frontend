export interface PrepareObject {
    id: number;
    descrizione: string;
    tipo: string | null;
    code: string | null;
}

export interface SearchFilters {
    TIPI_TERZE_PARTI: PrepareObject[];
    RAGIONI_SOCIALI: PrepareObject[];
    AZIENDE_GRUPPO: PrepareObject[];
    SETTORI_MERCEOLOGICI: PrepareObject[];
    BUSINESS_UNIT: PrepareObject[];
}