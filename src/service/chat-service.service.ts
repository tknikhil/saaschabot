import { Injectable } from '@angular/core';
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
      msg => console.log('Received WebSocket message:', msg),
      err => console.error('WebSocket error:', err),
      () => console.log('WebSocket connection closed')
    );
  }

  // Send a message using WebSocket
  sendMessage(msg: string): void {
    this.chatSocket.next(msg);
  }

  // Get incoming messages from WebSocket
  getMessages(): Observable<string> {
    return new Observable<string>(observer => {
      this.chatSocket.subscribe(
        (message: any) => {
          if (typeof message === 'string') {
            observer.next(message);
          } else if (message instanceof Blob) {
            // Convert Blob to text and pass to observer
            message.text().then(text => observer.next(text)).catch(err => observer.error(err));
          } else {
            console.error('Unexpected message type:', message);
          }
        },
        err => observer.error(err),
        () => observer.complete()
      );
    });
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