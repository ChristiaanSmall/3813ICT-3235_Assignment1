import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { AuthService } from '../auth.service';

interface Message {
  text?: string;
  imagePath?: string;
}

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  
  messages: Message[] = [];
  groupId: string = "";
  channelId: string = "";
  private apiUrl = 'http://localhost:4001/api';
  private socket!: Socket;
  username: string = "";
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.channelId = params['channelId'];

      this.getMessages().subscribe(messages => {
        this.messages = messages;
      });
    });
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id;  // Replace with the actual user ID
      this.authService.getUserById(userId).subscribe(user => {
        this.username = user.username;
      });
    }
  
    // Initialize Socket.io
    this.socket = io('http://localhost:4000', {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd"
      }
    });
    this.socket.emit('joinChannel', this.channelId);
    this.socket.on('newMessage', (message: any) => {
      console.log("Received raw message:", message);
      if (message.text && typeof message.text === 'object') {
        console.log("Text field:", message.text.text);
        this.messages.push({ text: message.text.text });
      } else if (message.text) {
        console.log("Text field:", message.text);
        this.messages.push({ text: message.text });
      }

      if (message.imagePath) {
        console.log("ImagePath field:", message.imagePath);

        message.imagePath = message.imagePath?.replace(/\\/g, '/');
        console.log("ImagePath field:", message.imagePath);
        this.messages.push({ imagePath: message.imagePath });
      }
    });

    this.socket.on('userJoined', (message: Message) => {
      this.messages.push(message);
    });

    this.socket.on('userLeft', (message: Message) => {
      this.messages.push(message);
    });
  }

  getMessages(): Observable<Message[]> {  // Change this line
    return this.http.get<Message[]>(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`);  // And this line
  }
  uploadImage(event: any): void {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    this.http.post('http://localhost:4001/upload', formData).subscribe(
      (response: any) => {
        console.log("Full response:", response);  // Debugging line
        const imagePath = response.filePath;
        this.sendMessage(imagePath, true);
      },
      (error) => {
        console.log("Error:", error);  // Debugging line
      }
    );
  }
  sendMessage(message: string, isImage: boolean = false): void {
    // Fetch the current user's ID from session storage
    const userData = sessionStorage.getItem('user');
    const newMessage: Message = isImage ? { imagePath: message } : { text: `${this.username}: ${message}` };  // Correct this line

    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id;
  
      // Fetch the username from the server
      this.authService.getUserById(userId).subscribe(user => {
        const username = user.username;
  
        // Prepend the username to the message
        message = `${username}: ${message}`;
  
        // Send the message to the server
        this.http.post(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`, { message: newMessage }).subscribe(response => {
          this.messages.push(newMessage);  // And this line
          this.socket.emit('sendMessage', { channel: this.channelId, message: newMessage });  // And this line
        });
      });
    }
  }

  goBack(): void {
    this.socket.emit('leaveChannel', this.channelId);  // Emit leave channel event
    this.router.navigate(['/dashboard']);
  }
}
