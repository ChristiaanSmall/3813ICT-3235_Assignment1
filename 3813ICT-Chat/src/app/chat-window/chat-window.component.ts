import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  
  messages: string[] = [];
  groupId: string = "";
  channelId: string = "";
  private apiUrl = 'http://localhost:3000/api';

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.channelId = params['channelId'];

      this.getMessages().subscribe(messages => {
        this.messages = messages;
      });
    });
  }

  getMessages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`);
  }

  sendMessage(message: string): void {
    this.http.post(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`, { message }).subscribe(response => {
      this.messages.push(message);
    });
  }
}
