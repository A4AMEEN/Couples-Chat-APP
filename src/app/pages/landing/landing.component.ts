import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="landing-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-container"></div>
          <h1>Private WhatsApp</h1>
          <p>Connect with your special someone</p>
        </div>

        <form (ngSubmit)="login()" class="login-form">
          <div class="form-group">
            <label for="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="name"
              required
              placeholder="Enter your name"
            />
          </div>

          <div class="form-group">
            <label for="code">Secret Code</label>
            <input
              type="password"
              id="code"
              name="code"
              [(ngModel)]="code"
              maxlength="4"
              placeholder="Enter the secret code"
              required
            />
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <button
            type="submit"
            class="login-button"
            [disabled]="isLoading || !name || !code"
          >
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Logging in...' : 'Enter Chat' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .landing-container {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to right, #128c7e, #25d366);
        padding: 1rem;
      }

      .login-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 400px;
        width: 100%;
      }

      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .logo-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .logo {
        height: 64px;
        width: 64px;
      }

      .login-header h1 {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 0.5rem;
      }

      .login-header p {
        color: #666;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #555;
        margin-bottom: 0.25rem;
      }

      .form-group select,
      .form-group input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }

      .form-group select:focus,
      .form-group input:focus {
        outline: none;
        border-color: #128c7e;
        box-shadow: 0 0 0 2px rgba(18, 140, 126, 0.2);
      }

      .error-message {
        color: #e53935;
        font-size: 0.875rem;
      }

      .login-button {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem 1rem;
        background-color: #128c7e;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .login-button:hover {
        background-color: #0e7369;
      }

      .login-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      .spinner {
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 0.5rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LandingComponent implements OnInit {
  name = '';
  code = '';
  error = '';
  isLoading = false;
  selectedUser: any = null;

  // Predefined users (you and your girlfriend)
  predefinedUsers = [
    { name: 'Your Name', id: 'user1' },
    { name: "Your Girlfriend's Name", id: 'user2' },
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/chat']);
    }
  }

  login(): void {
    if (!this.name) {
      this.error = 'Please enter your name';
      return;
    }
  
    if (!this.code) {
      this.error = 'Please enter the secret code';
      return;
    }
  
    this.isLoading = true;
    this.error = '';
  
    // Using the code as userId for simplicity
    // You might want to implement your own validation logic here
    const userId = this.code;
  
    this.authService
      .login(this.name, userId)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService
            .subscribeToNotifications()
            .then(() => this.router.navigate(['/chat']))
            .catch((err) =>
              console.error('Failed to subscribe to notifications', err)
            );
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.message || 'Login failed. Please try again.';
        },
      });
  }
}
