import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';  // Don't forget to import AuthService
import { ChangeDetectorRef } from '@angular/core';

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
  currentUserId: string;
  groups: any[] = []; 
  channels: string[] = []; 

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {
    const currentUser = this.authService.getCurrentUser();
    this.role = currentUser ? currentUser.role : '';
    this.currentUserId = currentUser ? currentUser.id : ''; 
  }

  ngOnInit(): void {
    this.groups = this.authService.getGroupsForUser(this.currentUserId, this.role);
  }
  updateChannels(): void {
    this.channels = this.authService.getChannels(this.selectedGroupId);
  }

  createGroup() {
    console.log("Before creating group, existing groups: ", this.groups);
    if (this.newGroupName && this.currentUserId) {
      this.authService.createGroup(this.newGroupName, this.currentUserId);
      this.newGroupName = '';
      this.groups = this.authService.getGroupsForUser(this.currentUserId, this.role);
      this.cdr.markForCheck();  // manually mark for change detection
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

  createChannel() {
    if (this.newChannelName && this.selectedGroupId) {
      this.authService.createChannel(this.newChannelName, this.selectedGroupId);
      this.newChannelName = '';  // Clear the input
    }
  }

}