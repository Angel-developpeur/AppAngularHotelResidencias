import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { getAuth, provideAuth } from '@angular/fire/auth';
  import { provideAnimations } from '@angular/platform-browser/animations';
  import { provideRouter } from '@angular/router';
  import { AppComponent } from './app/app.component';
  import { routes } from './app/app.routes';
  import { initializeApp } from '@angular/fire/app';
  import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
  import { enableProdMode } from '@angular/core';
  import { AngularFireModule } from '@angular/fire/compat';
  import { environment } from './environment';
  import { LoginComponent } from '../src/app/login/login.component'; 
  import { provideFirebaseApp } from '@angular/fire/app';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    AngularFireModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    
  ]
})
  .catch((err) => console.error(err));


  //
 // Cambia esto si el componente tiene un nombre diferente





