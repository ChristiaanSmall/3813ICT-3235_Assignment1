import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

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
  usernameToDelete: string = '';
  currentUser: any = null;
  usernameToPromote: string = '';
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

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
    if (this.currentUserId) {
      this.authService.getUserById(this.currentUserId)
        .pipe(take(1))  // take only the first emitted value
        .subscribe(
          user => {
            this.currentUser = user;
          },
          error => {
            console.error('Error fetching the current user:', error);
          }
        );
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
              this.newGroupName = '';
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
  deletionSuccess: boolean = false;

  // Method to delete a user account
  deleteUserAccount(username: string): void {
    this.authService.deleteUser(username).subscribe(
      response => {
        console.log("User account deleted:", response);
        this.deletionSuccess = true;
      },
      error => {
        console.log("Failed to delete user account:", error);
        this.deletionSuccess = false;
      }
    );
  }
  promotionSuccess: boolean = false;

  // Method to promote a user to Super Admin
  promoteToSuperAdmin(): void {
    this.authService.promoteToSuperAdmin(this.usernameToPromote).subscribe(
      response => {
        console.log("User promoted:", response);
        this.promotionSuccess = true;
      },
      error => {
        console.log("Failed to promote user:", error);
        this.promotionSuccess = false;
      }
    );
  }
  // Add this method to delete the currently logged-in user's account
  deleteOwnAccount(): void {
    if (this.currentUser) {
      this.authService.deleteUser(this.currentUser.username).subscribe(response => {
        console.log("Own account deleted:", response);
      });
      this.logout();
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  logout() {
    sessionStorage.clear();
    console.log("Logged Out Successfully");
    this.router.navigate(['/login']);
  }
}