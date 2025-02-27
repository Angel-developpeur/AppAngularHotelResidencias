import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';

// Import from @angular/fire/auth (not compat)
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule
    // Remove AngularFireAuthModule from here
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  hide = true;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          this.loginForm.value.email,
          this.loginForm.value.password
        );
        
        if (userCredential.user) { // Si el login es exitoso
          alert('Login successful');
          await this.router.navigate(['/home']);  // Redirigir a la página de inicio
        }
      } catch (error: any) { // Si ocurre un error durante el login
        console.error(error);
        let errorMessage = '';
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Email inválido';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Usuario deshabilitado';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Usuario no encontrado';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
          default:
            errorMessage = 'Error al iniciar sesión';
        }
        alert(errorMessage);  // Mostrar mensaje de error
      }
    }
  }
}