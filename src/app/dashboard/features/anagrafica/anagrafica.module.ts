import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AnagraficaComponent } from './anagrafica.component';


const routes: Routes = [
  { path: '', component: AnagraficaComponent }
];

@NgModule({
  declarations: [
    AnagraficaComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AnagraficaModule { }
