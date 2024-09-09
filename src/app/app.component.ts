import { Component, OnInit } from '@angular/core';
import { ChatServiceService } from '../service/chat-service.service';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  FormsModule,
CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'saaschabot';
  messages: string[] = [];
  newMessage: string = '';
  isChatboxOpen = false;

  constructor(private chatService: ChatServiceService) {}

  toggleChatbox() {
    this.isChatboxOpen = !this.isChatboxOpen;
  }

  ngOnInit(): void {
    // Subscribe to the incoming chat messages
    this.chatService.getMessages().subscribe((message: string) => {
      console.log('Received message:', message);
      this.messages.push(message);
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      // Send the message via WebSocket
      this.chatService.sendMessage(this.newMessage);

      // Optionally, also send the message via HTTP if needed
      this.chatService.sendHttpMessage(this.newMessage).subscribe();

      // Clear the input field
      this.newMessage = '';
    }
  }

  isSentByUser(message: any): boolean {
    // Add logic to determine if the message was sent by the user or not
    // For now, it's just a placeholder
    return typeof message === 'string' && message.startsWith('User:');
  }
}