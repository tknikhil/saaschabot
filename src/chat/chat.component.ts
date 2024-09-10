import { Component, computed, signal } from '@angular/core';
import { ChatServiceService } from '../service/chat-service.service';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

import { ChatMessage } from './chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    PickerComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  title = 'saaschabot';
  newMessage = signal('');
  isChatboxOpen = signal(false);
  showEmojiPicker = signal(false); // Flag to toggle the emoji picker

  // Signal to hold an array of ChatMessage objects
  messages = signal<ChatMessage[]>([]);

  constructor(private chatService: ChatServiceService, private router: Router) {}

  toggleChatbox() {
    this.isChatboxOpen.update(state => !state);
  }

  // Toggle emoji picker visibility
  toggleEmojiPicker() {
    this.showEmojiPicker.update(state => !state);
  }

  // Add selected emoji to the message input field
  addEmoji(event: any) {
    this.newMessage.update(msg => msg + event.emoji.native);   // Add emoji to the newMessage input field
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }

    // Load initial chat messages
    this.loadMessages();
  }

  loadMessages(): void {
    // Assuming getMessages() returns string[], we map the strings into ChatMessage[] format
    const messageArray = this.chatService.getMessages()(); // string[]

    const formattedMessages: ChatMessage[] = messageArray.map((message: string) => {
      // Assuming that the message format is something like 'Sender: Message'
      const [sender, ...contentParts] = message.split(':');
      const content = contentParts.join(':').trim();
      return {
        sender: sender.trim(),
        role: sender === 'User' ? 'customer' : 'support', // Assuming 'User' or 'Support' role based on sender
        content: content,
        timestamp: new Date(), // You can adjust the timestamp if you have it from the backend
      };
    });

    this.messages.update(() => formattedMessages);
  }

  sendMessage(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (this.newMessage()!.trim()) {
      const message: ChatMessage = {
        sender: currentUser.username,   // Assuming you store 'username' in localStorage
        role: currentUser.role,         // Role could be 'customer' or 'support'
        content: this.newMessage(),
        timestamp: new Date(),
      };
  
      // Send the message via WebSocket
      // this.chatService.sendMessage(message);
  
      // Optionally, also send the message via HTTP if needed
      this.chatService.sendHttpMessage(message).subscribe();
  
      // Clear the input field
      this.newMessage.update(() => '');
  
      // Add the new message to the local message list
      this.messages.update(messages => [...messages, message]);
    }
  }

  isSentByUser(message: ChatMessage): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return message.sender === currentUser.username;
  }
}