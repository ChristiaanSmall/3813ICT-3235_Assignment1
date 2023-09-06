import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  role: string = '';
  newGroupName: string = '';
  newChannelName: string = '';
  selectedGroupId: string = '';
  currentUserId: string = '';
  groups: any[] = [];
  channels: string[] = [];
  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Retrieve user information from sessionStorage
    const authenticated = sessionStorage.getItem('authenticated');

    if (authenticated === 'true') {
      // User is authenticated, retrieve user data from sessionStorage
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.role = user.role;
        this.currentUserId = user.id;
        console.log("role:", this.role);
      } else {
        // Handle the case where user data is missing
        console.log('User data is missing in sessionStorage.');
      }
    } else {
      // User is not authenticated, handle as needed
      console.log('User is not authenticated.');
      // You can redirect the user to the login page or handle it accordingly.
    }

    // Fetch groups
    this.subscriptions.push(
      this.authService.getGroups().subscribe(groups => {
        this.groups = groups;
      })
    );
  }

  updateChannels(): void {
    this.subscriptions.push(
      this.authService.getChannels(this.selectedGroupId).subscribe(channels => {
        this.channels = channels;
      })
    );
  }
createGroup() {
  console.log("Before creating group, existing groups: ", this.groups);
  if (this.newGroupName && this.currentUserId) {
    this.authService.createGroup(this.newGroupName, this.currentUserId).subscribe(
      () => {
        // Group created successfully, now fetch updated group list
        this.authService.getGroupsForUser(this.currentUserId, this.role).subscribe(
          groups => {
            this.groups = groups;
            this.newGroupName = ''; // Clear the input
          },
          error => {
            console.error('Error fetching groups:', error);
          }
        );
      },
      error => {
        console.error('Error creating group:', error);
      }
    );
    this.cdr.markForCheck(); // manually mark for change detection
  }
  console.log("After creating group, new groups: ", this.groups);
}


  addUserToGroup() {
    if (this.selectedGroupId && this.currentUserId) {  // Check if currentUserId is available
      this.authService.addUserToGroup(this.currentUserId, this.selectedGroupId);  // Use currentUserId
      this.selectedGroupId = '';  // Clear the input
    }
  }

  addAdminToGroup() {
    if (this.selectedGroupId && this.currentUserId) {  // Check if currentUserId is available
      this.authService.addAdminToGroup(this.currentUserId, this.selectedGroupId);  // Use currentUserId
      this.selectedGroupId = '';  // Clear the input
    }
  }

  createChannel(): void {
    this.authService.addChannelToGroup(this.newChannelName, this.selectedGroupId).subscribe(
      () => {
        this.updateChannels();
      },
      (error) => {
        console.error('Failed to create channel:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}