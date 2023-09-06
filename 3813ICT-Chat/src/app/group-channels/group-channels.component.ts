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
  addUserMessage: string = ''; // Feedback messages
  promoteUserMessage: string = '';
  usersInGroup: UserGroup = { admins: [], members: [] }; // Initialize as an object, not array
  allUsers: any[] = [];

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.authService.getGroups().subscribe(
        groups => {
          const group = groups.find(g => g.id === this.groupId);
          if (group) {
            this.channels = group.channels;
            this.role = group.role;
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
      this.authService.addUserToGroup(this.newUsername, this.groupId).subscribe(
        response => {
          this.addUserMessage = `User ${this.newUsername} added successfully.`;
          this.updateUsersInGroup();
        },
        error => {
          this.addUserMessage = 'User not found or already in the group.';
        }
      );
    }
  }

  promoteToGroupAdmin() {
    if (this.promoteUsername.trim() !== '') {
      this.authService.addAdminToGroup(this.promoteUsername, this.groupId).subscribe(
        response => {
          this.promoteUserMessage = `User ${this.promoteUsername} promoted to Group Admin.`;
          this.updateUsersInGroup();
        },
        error => {
          this.promoteUserMessage = 'User not found or already an admin.';
        }
      );
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
      return user ? user.name : 'Unknown';
    });
    
    const mappedMembers = users.members.map(id => {
      const user = this.allUsers.find(u => u.id === id);
      return user ? user.name : 'Unknown';
    });
    
    return {
      admins: mappedAdmins,
      members: mappedMembers
    };
  }
}