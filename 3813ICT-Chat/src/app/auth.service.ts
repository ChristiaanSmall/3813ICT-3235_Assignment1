import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4001/api';

  constructor(private http: HttpClient) {}

  // auth.service.ts
  authenticate(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, { username, password });
  }
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }
  getGroupRequests(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groups/${groupId}/requests`);
    
  }
  removeRequest(groupId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/groups/removeRequest`;
    const body = { groupId, userId };

    return this.http.post(url, body);
  }
  requestGroupAccess(userId: string, groupId: string): Observable<any> {
    console.log("group id: " + groupId + " user id: " + userId);
    return this.http.post(`${this.apiUrl}/groups/requestAccess`, { groupId, userId });
  }
  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/${groupId}`);
  }
  removeUserFromGroup(userId: string, groupId: string) {
    return this.http.delete(`/api/groups/${groupId}/users/${userId}`);
  }
  // Add this method
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/currentUser`);
  }
  // AuthService
  getRoleFromSession(): string {
    return sessionStorage.getItem('role') || '';
  }
  getGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groups`);
  }

  // Add this method
  getGroupsForUser(userId: string, role: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/groupsForUser?userId=${userId}&role=${role}`);
  }

  // Add this method
  getChannels(groupId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/groups/${groupId}/channels`);
  }

  // Add this method
  createGroup(groupName: string, adminId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/createGroup`, { groupName, adminId });
  }

  // Existing methods
  addUserToGroup(userId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/users`, { userId });
  }

  addAdminToGroup(adminId: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/admins`, { adminId });
  }
  deleteChannelFromGroup(channelName: string, groupId: string): Observable<any> {
    return this.http.delete(`/api/groups/${groupId}/channels/${channelName}`);
  }
  addChannelToGroup(channelName: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/channels`, { channelName });
  }
  createChannel(groupId: string, channelName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/channels`, { name: channelName });
  }
  getUsersInGroup(groupId: string): Observable<any[]> {
    const url = `${this.apiUrl}/groups/${groupId}/users`;
    console.log(`Fetching users from: ${url}`);  
    return this.http.get<any[]>(url);
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
    // Add this method to auth.service.ts
  register(username: string, password: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password, email });
  }
  deleteUser(username: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${username}`);
  }
  // Method to promote user to Super Admin
  promoteToSuperAdmin(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/promoteToSuperAdmin`, { username });
  }
}
