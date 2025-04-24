import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-chat-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="chat-header">
      <div class="header-content">
        <div class="partner-info">
          <div class="avatar-container">
            <div class="avatar">
              {{ partnerName?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <span 
              class="status-indicator" 
              [class.online]="partnerOnline"
              [class.offline]="!partnerOnline"
            ></span>
          </div>
          <div class="partner-details">
            <h1 class="partner-name">{{ partnerName || 'Partner' }}</h1>
            <p class="partner-status">
              <span *ngIf="currentUserName">You: {{ currentUserName }}</span>
              <span *ngIf="!currentUserName">{{ isTyping ? 'typing...' : (partnerOnline ? 'online' : 'offline') }}</span>
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button 
            (click)="callClicked.emit()" 
            class="action-button"
            title="Start call"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button 
            (click)="alertClicked.emit()" 
            class="action-button"
            title="Send alert"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button 
            (click)="logoutClicked.emit()" 
            class="action-button"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
    :host {
      display: block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add shadow */
    }
    .chat-header {
      background-color: #008069; /* WhatsApp Green */
      color: white;
      padding: 10px 15px; /* Adjusted padding */
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .partner-info {
      display: flex;
      align-items: center;
      gap: 12px; /* Space between avatar and text */
    }
    .avatar-container {
      position: relative;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e2e8f0; /* Tailwind gray-300 */
      color: #4a5568; /* Tailwind gray-700 */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }
    .status-indicator {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #008069; /* Match header background */
    }
    .status-indicator.online {
      background-color: #4ade80; /* Tailwind green-400 */
    }
    .status-indicator.offline {
      background-color: #9ca3af; /* Tailwind gray-400 */
    }
    .partner-details {
      display: flex;
      flex-direction: column;
    }
    .partner-name {
      font-weight: 600; /* Semibold */
      font-size: 16px;
      line-height: 1.2;
    }
    .partner-status {
      font-size: 12px;
      opacity: 0.9;
      line-height: 1.2;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px; /* Space between buttons */
    }
    .action-button {
      padding: 8px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 50%;
      display: flex; /* Center icon */
      align-items: center;
      justify-content: center;
    }
    .action-button:hover {
      background-color: #046d5a; /* Slightly darker green */
    }
    .action-icon {
      height: 20px;
      width: 20px;
    }
  `,
  ],
})
export class ChatHeaderComponent {
  @Input() partnerName: string | null = null
  @Input() partnerOnline = false
  @Input() isTyping = false
  @Input() currentUserName: string | null = null

  @Output() callClicked = new EventEmitter<void>()
  @Output() alertClicked = new EventEmitter<void>()
  @Output() logoutClicked = new EventEmitter<void>()
}
