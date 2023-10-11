import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { AuthService } from '../auth.service';
import { BehaviorSubject } from 'rxjs';

interface Message {
  text?: string;
  imagePath?: string;
  profilePicturePath?: string; // Add this line
}

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  profilePicturePath: string = ''; 
  messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  groupId: string = "";
  channelId: string = "";
  private apiUrl = 'http://localhost:4001/api';
  private socket!: Socket;
  username: string = "";
  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private http: HttpClient, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.channelId = params['channelId'];
    
      this.getMessages().subscribe(messages => {
        this.messagesSubject.next(messages);  // Update this line
      });
    });

    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id;  // Replace with the actual user ID
      this.authService.getUserById(userId).subscribe(user => {
        this.username = user.username;
        this.profilePicturePath = user.profilePicture; // Assume the user object has a field 'profilePicturePath'
        console.log(this.profilePicturePath);
      });
      this.username = user.username;
      this.joined(this.username);
    }
    // Initialize Socket.io
    this.socket = io('http://localhost:4000', {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd"
      }
    });
    this.socket.emit('joinChannel', { channel: this.channelId, username: this.username });

    this.socket.on('newMessage', (message: any) => {
      console.log("Received raw message:", message);
    
      // Create a new message object to hold the incoming data
      let newMessage: Message = {};
    
      if (message.text && typeof message.text === 'object') {
        console.log("Text field:", message.text.text);
        newMessage.text = message.text.text;
      } else if (message.text) {
        console.log("Text field:", message.text);
        newMessage.text = message.text;
      }
    
      if (message.imagePath) {
        console.log("ImagePath field:", message.imagePath);
        message.imagePath = message.imagePath?.replace(/\\/g, '/');
        console.log("ImagePath field:", message.imagePath);
        newMessage.imagePath = message.imagePath;
      }
    
      // Handle profile picture path if it exists
      if (message.profilePicturePath) {
        console.log("ProfilePicturePath field:", message.profilePicturePath);
        newMessage.profilePicturePath = message.profilePicturePath;
      }
    
      // Push the new message object to the messages array
      const currentMessages = this.messagesSubject.getValue();
      currentMessages.push(newMessage);
    
      // Assign a new array to trigger change detection
      this.messagesSubject.next([...currentMessages]);
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
    const newMessage: Message = isImage ? 
    { imagePath: message, profilePicturePath: this.profilePicturePath } : 
    { text: `${this.username}: ${message}`, profilePicturePath: this.profilePicturePath };

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
          this.socket.emit('sendMessage', { channel: this.channelId, message: newMessage });  // And this line
        });
      });
    }
    this.cdr.detectChanges();
  }
  systemMessage(message: string, isImage: boolean = false): void {
    // Fetch the current user's ID from session storage
    const userData = sessionStorage.getItem('user');
    const newMessage: Message = isImage ? 
    { imagePath: message, profilePicturePath: this.profilePicturePath } : 
    { text: `*System Message* ${this.username} - ${message}`, profilePicturePath: this.profilePicturePath };

    if (userData) {
      const user = JSON.parse(userData);
      const userId = user.id;
  
      // Fetch the username from the server
      this.authService.getUserById(userId).subscribe(user => {
        const username = user.username;
  
        // Prepend the username to the message
        message = `SYSYEM MESSAGE | ${message}`;
  
        // Send the message to the server
        this.http.post(`${this.apiUrl}/groups/${this.groupId}/channels/${this.channelId}/messages`, { message: newMessage }).subscribe(response => {
          this.socket.emit('sendMessage', { channel: this.channelId, message: newMessage });  // And this line
        });
      });
    }
    this.cdr.detectChanges();
  }
  joined(user: string): void {
    this.systemMessage("HAS JOINED", false);
    console.log(user);
  }

  left(): void {
    this.systemMessage("HAS LEFT", false);
    console.log("Left");
  }

  goBack(): void {
    // Include the username when leaving the channel
    this.left();
    this.socket.emit('leaveChannel', { channel: this.channelId, username: this.username });
    this.router.navigate(['/dashboard']);
  }
}
