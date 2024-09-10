import { Component, OnInit, computed, signal } from '@angular/core';
import { ChatServiceService } from '../service/chat-service.service';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    PickerComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'saaschabot';
  newMessage = signal('');
  isChatboxOpen = signal(false);
  showEmojiPicker = signal(false); // Flag to toggle the emoji picker

  // Reactive state for messages
  messages = computed(() => this.chatService.getMessages()());
  
  constructor(private chatService: ChatServiceService) {}

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
    // Subscribe to the Signal for incoming chat messages
    // this.chatService.getMessages().subscribe((messages: string[]) => {
    //   this.messages = messages;
    // });
  }

  sendMessage(): void {
    if (this.newMessage()!.trim()) {
      // Send the message via WebSocket
      this.chatService.sendMessage(this.newMessage());

      // Optionally, also send the message via HTTP if needed
      this.chatService.sendHttpMessage(this.newMessage()).subscribe();

      // Clear the input field
      this.newMessage.update(() => '');
    }
  }

  isSentByUser(message: any): boolean {
    // Add logic to determine if the message was sent by the user or not
    // For now, it's just a placeholder
    return typeof message === 'string' && message.startsWith('User:');
  }
}