import { Routes } from '@angular/router';
import { CardSearchComponent } from './components/card-search/card-search.component';
import { BlueEyesComponent } from './components/blue-eyes/blue-eyes.component';

export const routes: Routes = [
  { path: '',          redirectTo: 'search', pathMatch: 'full' },
  { path: 'search',    component: CardSearchComponent },
  { path: 'blue-eyes', component: BlueEyesComponent  },
];
