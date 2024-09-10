import { Injectable, Signal, signal } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private apiUrl = 'http://localhost:3000/api/chat'; // HTTP endpoint URL
  private loginApiUrl = 'http://localhost:3000/api/login'; // HTTP endpoint Login URL
  private webSocketUrl = 'ws://localhost:3000'; // WebSocket URL
  private chatSocket!: WebSocketSubject<any>;
  private messagesSignal = signal<string[]>([]); // Signal for messages
  private token: string | null = null; // Store JWT token

  constructor(private http: HttpClient ) {}

  // Method to initialize the WebSocket connection (called after login)
  private initializeWebSocketConnection(): void {
    if (!this.token) {
      console.error('No token found, cannot connect to WebSocket');
      return;
    }

    console.log('Initializing WebSocket connection...');
    this.chatSocket = webSocket({
      url: `${this.webSocketUrl}?token=${this.token}`, // Attach the token as a query parameter
      deserializer: (event: any) => {
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
    // Get headers with authorization token for HTTP requests
    private getAuthHeaders(): HttpHeaders {
      const token = this.getToken();
      return new HttpHeaders().set('Authorization', token ? `Bearer ${token}` : '');
    }

  // Handle incoming messages from WebSocket
  private handleMessage(message: any): void {
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
  // sendMessage(msg: string): void {
  //   this.chatSocket.next(msg);
  // }

 // Send a message using HTTP
sendHttpMessage(message: ChatMessage): Observable<any> {
  return this.http.post(this.apiUrl, message, { headers: this.getAuthHeaders() });
}

  // Get chat history using HTTP
  getChatHistory(): Observable<any> {
    return this.http.get(this.apiUrl + '/history', { headers: this.getAuthHeaders() });
  }

  // Login method
  login(username: string, password: string): Observable<any> {
    return this.http.post(this.loginApiUrl, { username, password });
  }

  // Store token after login and initialize WebSocket connection
  storeTokenAndInitializeConnection(token: string): void {
    this.token = token;
    localStorage.setItem('token', token); // Store the token locally for persistence
    this.initializeWebSocketConnection(); // Connect to WebSocket
  }

  // Get the token from local storage
  private getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }



  // Logout method to clear token
  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    if (this.chatSocket) {
      this.chatSocket.complete(); // Close WebSocket connection
    }
  }
}