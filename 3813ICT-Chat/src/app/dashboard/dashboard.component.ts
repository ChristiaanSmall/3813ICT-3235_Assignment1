import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  role: string;

  constructor() {
    // This is just an example. In a real-world application, the role would be fetched from the user's authentication data.
    this.role = 'Super Admin'; // or 'Group Admin' or 'User'
  }

  ngOnInit(): void {
  }
}
