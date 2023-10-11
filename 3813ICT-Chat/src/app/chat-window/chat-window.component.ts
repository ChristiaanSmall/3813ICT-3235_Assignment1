import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import io, { Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  
  messages: string[] = [];
  groupId: string = "";
  channelId: string = "";
  private apiUrl = 'http://localhost:4001/api';
  private socket!: Socket;
  
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.channelId = params['channelId'];

      this.getMessages().subscribe(messages => {
        this.messages = messages;
      });
    });

    // Initialize Socket.io
    this.socket = io('http://localhost:4000', {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd"
      }
    });
    this.socket.emit('joinChannel', this.channelId);
    this.socket.on('newMessage', (message) => {
      this.messages.push(message);
    });

    this.socket.on('userJoined', (message) => {
      this.messages.push(message);
    });

    this.socket.on('userLeft', (message) => {
      this.messages.push(message);
    });
  }

  getMessages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`);
  }

  sendMessage(message: string): void {
    this.http.post(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`, { message }).subscribe(response => {
      this.socket.emit('sendMessage', { channel: this.channelId, message });  // Emitting the message via Socket.io
    });
  }

  goBack(): void {
    this.socket.emit('leaveChannel', this.channelId);  // Emit leave channel event
    this.router.navigate(['/dashboard']);
  }
}
