import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}
  
  onLogin(): void {
    this.authService.authenticate(this.username, this.password).subscribe(
      user => {
        if (user) {
          // Store authentication status in sessionStorage
          sessionStorage.setItem('authenticated', 'true');

          // Store user data in sessionStorage
          sessionStorage.setItem('user', JSON.stringify(user));

          // Navigate to the dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error => {
        alert('Invalid credentials');
      }
    );
  }
}
