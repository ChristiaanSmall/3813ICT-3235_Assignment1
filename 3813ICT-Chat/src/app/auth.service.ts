import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
    // Populate initial users if not already present
    if (!localStorage.getItem('users')) {
      let initialUsers = [
        { id: '1', username: 'super', password: '123', role: 'Super Admin', groups: [] },
        { id: '2', username: 'groupadmin', password: '123', role: 'Group Admin', groups: [] },
        { id: '3', username: 'user', password: '123', role: 'User', groups: [] }
      ];
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    // Initialize groups if not already present
    if (!localStorage.getItem('groups')) {
      const initialGroups = [
        { id: '1', name: 'Group1', channels: ['Channel1', 'Channel2'], admins: ['2'], members: ['3'] },
        { id: '2', name: 'Group2', channels: ['Channel1'], admins: ['2', '3'] }
      ];
      localStorage.setItem('groups', JSON.stringify(initialGroups));
    }
  }

  authenticate(username: string, password: string): any {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  }

  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  getGroups(): any[] {
    return JSON.parse(localStorage.getItem('groups') || '[]');
  }
  
  getChannels(groupId: string): string[] {
    const groups = this.getGroups();
    const group = groups.find((g: any) => g.id === groupId);
    return group ? group.channels : [];
  }
  createGroup(groupName: string, adminId: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const newGroupId = (groups.length + 1).toString();
    const newGroup = {
      id: newGroupId,
      name: groupName,
      channels: [],
      admins: [adminId],
      members: [] // Initialize members array for the new group
    };
    groups.push(newGroup);
    localStorage.setItem('groups', JSON.stringify(groups));
  }
  
  addUserToGroup(userId: string, groupId: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    console.log('groups:', groups);
  
    const group = groups.find((g: any) => g.id === groupId);
    console.log('group:', group);
  
    if (group && group.members && !group.members.includes(userId)) {
      console.log('Adding user to group');
      group.members.push(userId);
    } else {
      console.log('User is already a member of the group');
    }
    
    localStorage.setItem('groups', JSON.stringify(groups));
  }
  
  addAdminToGroup(adminId: string, groupId: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const group = groups.find((g: any) => g.id === groupId);
    if (group && !group.admins.includes(adminId)) {
      group.admins.push(adminId);
    }
    localStorage.setItem('groups', JSON.stringify(groups));
  }
  
  createChannel(channelName: string, groupId: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const group = groups.find((g: any) => g.id === groupId);
    if (group) {
      group.channels.push(channelName);
    }
    localStorage.setItem('groups', JSON.stringify(groups));
  }

  getGroupsForUser(userId: string, role: string): any[] {
    const allGroups = this.getGroups();
    
    // If the user is a Super Admin, return all groups.
    if (role === 'Super Admin') {
      return allGroups;
    }
    
    const userGroups = allGroups.filter(group => group.admins.includes(userId) || group.members.includes(userId));
    return userGroups;
  }

  // Inside AuthService class
  getUserByUsername(username: string): any {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: any) => u.username === username);
  }
  getUsersInGroup(groupId: string): any[] {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const group = groups.find((g: any) => g.id === groupId);
  
    if (group && group.members) { // Check if group and members array are initialized
      return users.filter((user: any) => group.members.includes(user.id));
    }
    return [];
  }
  
}
