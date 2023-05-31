import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AnagraficaComponent } from './anagrafica.component';
import { AltreAziendeComponent } from './altre-aziende/altre-aziende.component';
import { AltrePersoneComponent } from './altre-persone/altre-persone.component';
import { AziendeGruppoComponent } from './aziende-gruppo/aziende-gruppo.component';
import { PersoneOrganicoComponent } from './persone-organico/persone-organico.component';
import { SharedModule } from 'src/app/shared/shared.module';


const routes: Routes = [
  { path: '', component: AnagraficaComponent },
  { path: 'persone-organico', component: PersoneOrganicoComponent },
  { path: 'altre-persone', component: AltrePersoneComponent },
  { path: 'aziende-gruppo', component: AziendeGruppoComponent },
  { path: 'altre-aziende', component: AltreAziendeComponent },
];

@NgModule({
  declarations: [
    AnagraficaComponent,
    AltreAziendeComponent,
    AltrePersoneComponent,
    AziendeGruppoComponent,
    PersoneOrganicoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class AnagraficaModule { }
