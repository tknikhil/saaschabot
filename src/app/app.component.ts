import { Component, OnInit } from '@angular/core';
import { ChatServiceService } from '../service/chat-service.service';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji'
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  FormsModule,
CommonModule,
PickerModule, EmojiModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'saaschabot';
  messages: string[] = [];
  newMessage: string = '';
  isChatboxOpen = false;
  showEmojiPicker = false; // Flag to toggle the emoji picker

  constructor(private chatService: ChatServiceService) {}

  toggleChatbox() {
    this.isChatboxOpen = !this.isChatboxOpen;
  }
   // Toggle emoji picker visibility
   toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // Add selected emoji to the message input field
  addEmoji(event: any) {
    this.newMessage += event.emoji.native; // Add emoji to the newMessage input field
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