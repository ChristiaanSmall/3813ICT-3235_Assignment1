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
  otherGroups: any[] = [];
  channels: string[] = [];
  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const authenticated = sessionStorage.getItem('authenticated');
    if (authenticated === 'true') {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.role = user.role;
        this.currentUserId = user.id;
      }
    } else {
      console.log('User is not authenticated.');
    }

    this.subscriptions.push(
      this.authService.getGroups().subscribe(allGroups => {
        this.groups = allGroups.filter(group => this.isUserInGroup(group));
        this.otherGroups = allGroups.filter(group => !this.isUserInGroup(group));
        console.log('groups:', this.groups);
        console.log('otherGroups:', this.otherGroups);

        if (this.groups.length === 0 && this.otherGroups.length === 0) {
          alert("There are no groups.");
        } else if (this.groups.length === 0) {
          alert("You are not a member of any group.");
        }
      })
    );
  }
  requestAccess(groupId: string): void {
    console.log('Requesting access to group:', groupId);
    console.log('Current User ID:', this.currentUserId);
    this.authService.requestGroupAccess(this.currentUserId, groupId).subscribe(
      () => console.log('Request successful'),
      () => console.log('Request failed')
    );
  }
  
  isUserInGroup(group: any): boolean {
    console.log('Checking if user is in group:', group);
    console.log('Current User ID:', this.currentUserId);
  
    if (this.role === 'Super Admin') {
      console.log('User is a Super Admin, has access to all groups.');
      return true;
    }
  
    const isInUsers = group.members && Array.isArray(group.members) && group.members.includes(this.currentUserId);
    const isInAdmins = group.admins && Array.isArray(group.admins) && group.admins.includes(this.currentUserId);
  
    const condition = isInUsers || isInAdmins;
  
    console.log('Condition evaluated to:', condition);
  
    return condition;
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