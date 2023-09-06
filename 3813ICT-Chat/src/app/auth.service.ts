import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // auth.service.ts
  authenticate(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, { username, password });
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

  addChannelToGroup(channelName: string, groupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/channels`, { channelName });
  }

  getUsersInGroup(groupId: string): Observable<any[]> {
    const url = `${this.apiUrl}/groups/${groupId}/users`;
    console.log(`Fetching users from: ${url}`);  // Log the URL
    return this.http.get<any[]>(url);
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
}
