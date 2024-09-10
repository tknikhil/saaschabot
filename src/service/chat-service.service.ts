import { Injectable,Signal,signal } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private apiUrl = 'http://localhost:3000/api/chat'; // HTTP endpoint URL
  private webSocketUrl = 'ws://localhost:3000'; // WebSocket URL
  private chatSocket: WebSocketSubject<any>;
  private messagesSignal = signal<string[]>([]); // Signal for messages

  constructor(private http: HttpClient) {
    console.log('Initializing WebSocket connection...');
    this.chatSocket = webSocket({
      url: this.webSocketUrl,
      // Custom deserializer to handle both text and Blob messages
      deserializer: (event: any) => {
        // Check if the message is a Blob
        if (event.data instanceof Blob) {
          return event.data.text(); // Convert Blob to text
        } else {
          return event.data; // Handle as text directly
        }
      },
    });

    this.chatSocket.subscribe(
      msg => this.handleMessage(msg),
      err => console.error('WebSocket error:', err),
      () => console.log('WebSocket connection closed')
    );
  }

  private handleMessage(message: any): void {
    console.log(message,"messagez");
    if (typeof message === 'string') {
      this.messagesSignal.update(messages => [...messages, message]);
    } else if (message instanceof Blob) {
      message.text().then(text => this.messagesSignal.update(messages => [...messages, text])).catch(err => console.error(err));
    } else {
      console.error('Unexpected message type:', message);
    }
  }

  // Get messages as a Signal
  getMessages(): Signal<string[]> {
    return this.messagesSignal;
  }

  // Send a message using WebSocket
  sendMessage(msg: string): void {
    this.chatSocket.next(msg);
  }

  // Send a message using HTTP (optional)
  sendHttpMessage(message: string): Observable<any> {
    return this.http.post(this.apiUrl, { message });
  }

  // Get chat history using HTTP
  getChatHistory(): Observable<any> {
    return this.http.get(this.apiUrl + '/history');
  }
}