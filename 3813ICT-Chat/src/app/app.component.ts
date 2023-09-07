import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {
    // Listen to route change events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.checkUserSession());
  }

  ngOnInit(): void {
    this.checkUserSession();
  }

  checkUserSession(): void {
    const user = sessionStorage.getItem('user');
    if (user) {
      this.user = JSON.parse(user);
    } else {
      this.user = null;
    }
  }

  logout(): void {
    sessionStorage.clear();
    console.log("Logged Out Successfully");
    this.router.navigate(['/login']);
  }
}
