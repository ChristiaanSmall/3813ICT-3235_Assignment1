import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

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

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    // Retrieve role from sessionStorage
    const authenticated = sessionStorage.getItem('authenticated');
    if (authenticated === 'true') {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.role = user.role;
        console.log("Role from session data:", this.role); // Log role from session data
      } else {
        console.log('User data is missing in sessionStorage.');
      }
    } else {
      console.log('User is not authenticated.');
    }
  
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.authService.getGroups().subscribe(
        groups => {
          const group = groups.find(g => g.id === this.groupId);
          if (group) {
            this.channels = group.channels;
          }
        }
      );
      this.authService.getAllUsers().subscribe(
        allUsers => {
          this.allUsers = allUsers;
          this.updateUsersInGroup();
        }
      );
    }); // Closing for ngOnInit
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

  addChannelToGroup() {
    if (this.newChannelName.trim() !== '') {
      this.authService.addChannelToGroup(this.newChannelName, this.groupId).subscribe(
        response => {
          this.addChannelMessage = `Channel ${this.newChannelName} created successfully.`;
          this.channels.push(this.newChannelName); // Add the new channel to local channels array
          this.newChannelName = ''; // Clear the input field
        },
        error => {
          this.addChannelMessage = 'Failed to create the channel.';
        }
      );
    }
  }

}