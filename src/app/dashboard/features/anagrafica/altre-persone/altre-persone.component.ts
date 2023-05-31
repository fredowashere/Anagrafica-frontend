import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, merge, of, switchMap, takeUntil, tap } from 'rxjs';
import { AnagraficaService } from '../services/anagrafica.service';
import { Contatto } from '../models/contatto';

@Component({
  selector: 'app-altre-persone',
  templateUrl: './altre-persone.component.html',
  styleUrls: ['./altre-persone.component.css']
})
export class AltrePersoneComponent {

  refresh$ = new Subject<void>();
  destroy$ = new Subject<void>();
  isLoading = false;
  init = false;
  contatti: Contatto[] = [];

  cognomeCtrl = new FormControl();
  nomeCtrl = new FormControl();
  
  referenti = [];
  referenteCtrl = new FormControl();

  constructor(
    private anagraficaService: AnagraficaService
  ) {}

  ngOnInit() {
    merge(
      of({}), // Launch as soon as the user lands
      this.refresh$
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.isLoading = true),
        switchMap(() =>
          this.anagraficaService.altrePersone({})
        ),
        tap(response => {
          this.contatti = response;
          this.isLoading = false;
          if (!this.init) this.init = true;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  nop() {}

}
