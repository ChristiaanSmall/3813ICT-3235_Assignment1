import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface UserGroup {
  admins: string[];
  members: string[];
}

@Component({
  selector: 'app-group-channels',
  templateUrl: './group-channels.component.html',
  styleUrls: ['./group-channels.component.css']
})
export class GroupChannelsComponent implements OnInit {
  groupId!: string;
  channels: string[] = [];
  role!: string;
  newUsername: string = '';
  promoteUsername: string = '';
  addUserMessage: string = '';
  promoteUserMessage: string = '';
  usersInGroup: UserGroup = { admins: [], members: [] };
  allUsers: any[] = [];
  newChannelName: string = '';
  addChannelMessage: string = '';
  groups: any[] = [];
  groupRequests: any[] = [];
  private subscriptions: Subscription[] = [];
  userNames: { [userId: string]: string } = {};

  currentUser: any = null; // Declare a class property to store the current user

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Retrieve role from sessionStorage
    const authenticated = sessionStorage.getItem('authenticated');
    if (authenticated === 'true') {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.role = user.role;
      } else {
        console.log('User data is missing in sessionStorage.');
      }
    } else {
      console.log('User is not authenticated.');
    }
  
    this.route.params.subscribe((params: any) => {
      this.groupId = params['groupId'];
      this.authService.getGroups().subscribe(
        (groups: any[]) => {
          this.groups = groups;
          const group = this.groups.find(g => g.id === this.groupId);
          if (group) {
            this.channels = group.channels;
          }
        },
        error => {
          console.error(`Error fetching groups: ${JSON.stringify(error)}`);
        }
      );
  
      this.authService.getAllUsers().subscribe(
        allUsers => {
          this.allUsers = allUsers;
          this.updateUsersInGroup();
        }
      );
  
      this.subscriptions.push(
        this.authService.getGroupRequests(this.groupId).subscribe(requests => {
          this.authService.getUsersInGroup(this.groupId).subscribe(
            (users: any) => {
              if ('admins' in users && 'members' in users) {
                // Filter out requests from users who are already members or admins
                this.groupRequests = requests.filter(requestId => {
                  const user = this.allUsers.find(u => u.id === requestId);
                  const username = user ? user.username : '';
                  return !(
                    this.usersInGroup.members.includes(username) ||
                    this.usersInGroup.admins.includes(username)
                  );
                });
    
                // Populate userNames with user names corresponding to their IDs
                for (const requestId of this.groupRequests) {
                  this.authService.getUserById(requestId).subscribe((user: any) => {
                    if (user && user.username) {
                      this.userNames[requestId] = user.username;
                    }
                  });
                }
              } else {
                console.error('Received unexpected data format:', users);
              }
            },
            error => {
              console.error(`Error fetching users: ${JSON.stringify(error)}`);
            }
          );
        })
      );
    });
  }
  
  approveRequest(requestId: string) {
    // Fetch user data by ID and replace the requestId with the user's name
    this.authService.getUserById(requestId).subscribe((user: any) => {
      if (user && user.username) {
        this.newUsername = user.username;
  
        // Check if the user is already a member or admin in the group
        if (
          this.usersInGroup.members.includes(this.newUsername) ||
          this.usersInGroup.admins.includes(this.newUsername)
        ) {
          // If the user is already a member or admin, remove the request
          this.groupRequests = this.groupRequests.filter(req => req !== requestId);
        } else {
          // If not, proceed to approve the request and remove it
          this.groupRequests = this.groupRequests.filter(req => req !== requestId);
          this.addUserToGroup();
        }
      }
    });
  }
  deleteGroup() {
    if (this.groupId) {
      this.authService.deleteGroup(this.groupId).subscribe(
        response => {
          console.log('Group deleted successfully.');
          this.router.navigate(['/dashboard']); // Navigate to dashboard
        },
        error => {
          console.error(`Failed to delete the group: ${JSON.stringify(error)}`);
        }
      );
    }
  }
  
  removeUserFromGroup(username: string) {
    const user = this.allUsers.find(u => u.username === username);
    if (user) {
      if (this.usersInGroup.members.includes(username) || this.usersInGroup.admins.includes(username)) {
        this.authService.removeUserFromGroup(user.id, this.groupId).subscribe(
          response => {
            this.updateUsersInGroup();
          },
          error => {
            console.error(`Failed to remove user: ${JSON.stringify(error)}`);
          }
        );
      } else {
        console.log(`User ${username} is not in the group.`);
      }
    } else {
      console.log('User not found.');
    }
  }
  addUserToGroup() {
    if (this.newUsername.trim() !== '') {
      const user = this.allUsers.find(u => u.username === this.newUsername);
      if (user) {
        // Check if user is already in the group
        if (this.usersInGroup.members.includes(user.username) || this.usersInGroup.admins.includes(user.username)) {
          this.addUserMessage = `User ${this.newUsername} is already in the group.`;
          return;
        }

        this.authService.addUserToGroup(user.id, this.groupId).subscribe(
          response => {
            this.addUserMessage = `User ${this.newUsername} added successfully.`;
            this.updateUsersInGroup();
          },
          error => {
            this.addUserMessage = 'User not found or an error occurred.';
          }
        );
      }
    }
  }

  promoteToGroupAdmin() {
    if (this.promoteUsername.trim() !== '') {
      const user = this.allUsers.find(u => u.username === this.promoteUsername);
      if (user) {
        // Check if user is already an admin
        if (this.usersInGroup.admins.includes(user.username)) {
          this.promoteUserMessage = `User ${this.promoteUsername} is already an admin.`;
          return;
        }

        // Check if user is in the group
        if (!this.usersInGroup.members.includes(user.username) && !this.usersInGroup.admins.includes(user.username)) {
          this.promoteUserMessage = `User ${this.promoteUsername} is not in the group.`;
          return;
        }

        this.authService.addAdminToGroup(user.id, this.groupId).subscribe(
          response => {
            this.promoteUserMessage = `User ${this.promoteUsername} promoted to Group Admin.`;
            this.updateUsersInGroup();

            // Update session data with the new role
            const updatedUser = { ...user, role: 'Group Admin' };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          },
          error => {
            this.promoteUserMessage = 'An error occurred while promoting the user.';
          }
        );
      } else {
        this.promoteUserMessage = 'User not found.';
      }
    }
  }

  isUserAdminInGroup(): boolean {
    // Check if the current user is already available
    if (this.currentUser) {
      const currentUserId = this.currentUser.id;
      const group = this.groups.find((g) => g.id === this.groupId);
      const isSuperAdmin = this.role === 'Super Admin';

      // Check if the current user is a Super Admin or an Admin in the group
      return isSuperAdmin || (group?.admins.includes(currentUserId) || false);
    }

    // Subscribe to getCurrentUser only if the current user is not available
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentUser = user;
        const currentUserId = user.id;

        // Add a console log here
        console.log(`Current User ID: ${currentUserId}`);
      }
    });

    return false;
  }

  updateUsersInGroup() {
    console.log(`Updating users for group ID: ${this.groupId}`);
    this.authService.getUsersInGroup(this.groupId).subscribe(
      (users: any) => {
        if ('admins' in users && 'members' in users) {
          this.usersInGroup = this.mapUsersToNames(users);
        } else {
          console.error('Received unexpected data format:', users);
        }
      },
      error => {
        console.error(`Error fetching users: ${JSON.stringify(error)}`);
      }
    );
  }

  mapUsersToNames(users: {admins: string[], members: string[]}): any {
    const mappedAdmins = users.admins.map(id => {
      const user = this.allUsers.find(u => u.id === id);
      return user ? user.username : 'Unknown';
    });

    const mappedMembers = users.members.map(id => {
      const user = this.allUsers.find(u => u.id === id);
      return user ? user.username : 'Unknown';
    });

    return {
      admins: mappedAdmins,
      members: mappedMembers
    };
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());  // Add this to unsubscribe
  }
  addChannelToGroup() {
    if (this.newChannelName.trim() !== '') {
      this.authService.addChannelToGroup(this.newChannelName, this.groupId).subscribe(
        response => {
          this.addChannelMessage = `Channel ${this.newChannelName} created successfully.`;
          this.channels.push(this.newChannelName);
          this.newChannelName = '';
        },
        error => {
          this.addChannelMessage = 'Failed to create the channel.';
        }
      );
    }
  }
}
