import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Auth } from '../../interfaces/auth.interface';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule, ToastModule, ProgressSpinnerModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  providers: [AuthService, MessageService],
})
export class LoginPageComponent {
  usuario: string = '';
  password: string = '';
  loading = false;

  constructor(
    private _authService: AuthService,
    private _mesageServices: MessageService,
    private _router: Router
  ) { }

  onAuthenticated() {
    if (this.verificatedInputs()) {
      this.loading = true;
      const body = { usuario: this.usuario, password: this.password };
      this._authService
        .postAuthenticated(body)
        .pipe(timeout(10000))
        .subscribe({
          next: (res: Auth) => {
            if (res) {
              this.loading = false;
              this._router.navigate(['/blh']);
              this._mesageServices.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Bienvenido ' + res.user.usuario,
                key: 'tr',
                life: 3000,
              });
            }
          },
          error: (error) => {
            if (error.status === 401) {
              this.loading = false;
              this._mesageServices.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Usuario o Contraseña incorrectos',
                key: 'tr',
                life: 3000,
              });
            } else {
              this.loading = false;
              this._mesageServices.add({
                severity: 'error',
                summary: 'Error de red',
                detail: 'Ocurrió un error al procesar la solicitud.',
                key: 'tr',
                life: 3000,
              });
            }
          },
        });
    }
  }

  verificatedInputs(): boolean {
    let msg: string = '';
    let flat: boolean = true;
    if (this.usuario === '') {
      msg += ' usuario';
      flat = false;
    }
    if (this.password === '') {
      msg += ' contraseña';
      flat = false;
    }

    if (msg.length > 0) {
      this._mesageServices.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese' + msg,
        key: 'tr',
        life: 3000,
      });
    }

    return flat;
  }
}
