import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ExtrasComponent } from './components/extras/extras.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
//import { CalendarExampleComponent } from './components/calendar-example/calendar-example.component';
export const routes: Routes = [
    { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'calendar/:id', component: CalendarComponent },
  { path: 'rooms/:id', component: RoomsComponent },
  { path: 'extras', component: ExtrasComponent},
  { path: 'reservations/:id', component: ReservationsComponent},
 

];

