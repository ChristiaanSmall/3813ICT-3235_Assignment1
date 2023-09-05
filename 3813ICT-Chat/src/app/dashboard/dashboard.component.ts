import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';  // Don't forget to import AuthService

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  role: string;
  newGroupName: string = '';  // For storing the new group name
  newChannelName: string = '';  // For storing the new channel name
  selectedGroupId: string = '';  // For storing the selected group ID

  constructor(private authService: AuthService) {  // Inject AuthService
    const currentUser = this.authService.getCurrentUser();
    this.role = currentUser ? currentUser.role : '';
  }

  ngOnInit(): void {
  }

  // Method stubs for UI actions, to be filled in
  createGroup() {
    // TODO: Implement
  }

  addUserToGroup() {
    // TODO: Implement
  }

  addAdminToGroup() {
    // TODO: Implement
  }

  createChannel() {
    // TODO: Implement
  }
}