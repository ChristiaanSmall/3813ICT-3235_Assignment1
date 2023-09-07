import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.authService.register(this.username, this.password, this.email).subscribe(
      user => {
        if (user) {
          alert('Registration successful');
          this.router.navigate(['/login']);
        }
      },
      error => {
        alert('Registration failed');
      }
    );
  }
}
