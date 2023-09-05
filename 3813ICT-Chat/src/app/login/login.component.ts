import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService) {}

  onLogin(): void {
    const role = this.authService.authenticate(this.username, this.password);
    if (role) {
      // Navigate to dashboard
    } else {
      // Show error message
    }
  }
}
