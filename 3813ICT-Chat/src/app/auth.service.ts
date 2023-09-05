import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
    // Populate initial users if not already present
    if (!localStorage.getItem('users')) {
      const initialUsers = [
        { id: '1', username: 'super', password: '123', role: 'Super Admin', groups: [] },
        { id: '2', username: 'groupadmin', password: '123', role: 'Group Admin', groups: [] },
        { id: '3', username: 'user', password: '123', role: 'User', groups: [] }
      ];
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    // Initialize groups if not already present
    if (!localStorage.getItem('groups')) {
      const initialGroups = [
        { id: '1', name: 'Group1', channels: ['Channel1', 'Channel2'], admins: ['2'] },
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser;
  }


  createGroup(groupName: string, adminId: string): void {
    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
    const newGroupId = (groups.length + 1).toString();
    const newGroup = { id: newGroupId, name: groupName, channels: [], admins: [adminId] };
    groups.push(newGroup);
    localStorage.setItem('groups', JSON.stringify(groups));
  }
  
  addUserToGroup(userId: string, groupId: string): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.id === userId);
    if (user && !user.groups.includes(groupId)) {
      user.groups.push(groupId);
    }
    localStorage.setItem('users', JSON.stringify(users));
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
}
