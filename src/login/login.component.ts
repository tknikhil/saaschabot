import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatServiceService } from '../service/chat-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  errorMessage = signal('');

  constructor(private router: Router, private loginService: ChatServiceService) {}

  login() {
    const username = this.username();
    const password = this.password();

    this.loginService.login(username, password).subscribe({
      next: (res: any) => {
        console.log(res, "response");
        if (res.token) {
          this.loginService.storeTokenAndInitializeConnection(res.token);
          this.router.navigate(['chat']);
        } else {
          this.errorMessage.update(() => 'Unexpected response format');
        }
      },
      error: () => {
        this.errorMessage.update(() => 'Invalid login');
      }
    });
  }
}