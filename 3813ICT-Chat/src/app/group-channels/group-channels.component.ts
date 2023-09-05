import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

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
  usersInGroup: any[] = []; // List of users in the group

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('Params:', params); // Check the value of params['groupId']
      this.groupId = params['groupId'];
      console.log('GroupId:', this.groupId); // Verify the value of this.groupId
      this.channels = this.authService.getChannels(this.groupId);
      this.role = this.authService.getCurrentUser().role;
      this.updateUsersInGroup();
    });
  }

  addUserToGroup() {
    if (this.newUsername.trim() !== '') {
      const user = this.authService.getUserByUsername(this.newUsername);
      if (user) {
        this.authService.addUserToGroup(user.id, this.groupId);
        this.newUsername = '';
        this.addUserMessage = `User ${user.username} added successfully.`;
        this.updateUsersInGroup();
      } else {
        this.addUserMessage = 'User not found.';
      }
    }
  }

  promoteToGroupAdmin() {
    if (this.promoteUsername.trim() !== '') {
      const user = this.authService.getUserByUsername(this.promoteUsername);
      if (user) {
        this.authService.addAdminToGroup(user.id, this.groupId);
        this.promoteUsername = '';
        this.promoteUserMessage = `User ${user.username} promoted to Group Admin.`;
        this.updateUsersInGroup();
      } else {
        this.promoteUserMessage = 'User not found.';
      }
    }
  }

  updateUsersInGroup() {
    this.usersInGroup = this.authService.getUsersInGroup(this.groupId);
    console.log("Users in group:", this.usersInGroup);
  }
}