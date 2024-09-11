import { Observable } from "rxjs";
import { ChatMessage } from "../chat/chat-message.model";
import { Injectable, signal, Signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
@Injectable({
  providedIn: 'root' // This makes the service a singleton and available app-wide
})
export class ChatServiceService {
  private apiUrl = 'http://localhost:3000/api/chat'; // HTTP endpoint URL
  private loginApiUrl = 'http://localhost:3000/api/login'; // HTTP endpoint Login URL
  private webSocketUrl = 'ws://localhost:3000'; // WebSocket URL
  private chatSocket!: WebSocketSubject<any>;
  private messagesSignal = signal<ChatMessage[]>([]); // Signal for messages
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
      deserializer: (event: MessageEvent) => {
        try {
          return JSON.parse(event.data); // Parse WebSocket message as JSON
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          return event.data; // Return raw data if parsing fails
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
    console.log('Raw message received:', message);
    if (message && typeof message === 'object' && message.sender && message.role) {
      const content = message.content || ''; // Provide a default value if content is missing
      const timestamp = message.timestamp ? new Date(message.timestamp) : new Date(); // Default to now if timestamp is missing
      
      // Update the messages signal with the parsed object
      this.messagesSignal.update(messages => [
        ...messages,
        {
          sender: message.sender,
          role: message.role,
          content: content,
          timestamp: timestamp,
        },
      ]);
    } else {
      console.error('Unexpected message format:', message);
    }
  }

  // Get messages as a Signal
  getMessages(): Signal<ChatMessage[]> {
    return this.messagesSignal;
  }

  // Send a message using WebSocket
  sendMessage(message: ChatMessage): void {
    if (this.chatSocket) {
      this.chatSocket.next(message);
    } else {
      console.error('WebSocket is not connected.');
    }
  }

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