import { Component, Input, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { Message } from "../../services/chat.service"
import  { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-message-bubble",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-container" [ngClass]="{'own-message': isOwnMessage, 'partner-message': !isOwnMessage}">
      <div class="message-bubble">
        <!-- Message sender name - show only if showNames is true -->
        <div class="sender-name" *ngIf="showNames">
          {{ message.senderName }}
        </div>
        
        <!-- Text message -->
        <div *ngIf="message.type === 'text'" class="message-text">
          {{ message.content }}
        </div>
        
        <!-- Voice message -->
        <div *ngIf="message.type === 'voice'" class="voice-message">
          <button 
            (click)="playVoiceMessage(message.content)" 
            class="play-button"
            [ngClass]="{'own-play-button': isOwnMessage, 'partner-play-button': !isOwnMessage}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="play-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
          </button>
          <div class="audio-progress-container">
            <div class="audio-progress-bar">
              <div 
                class="audio-progress"
                [ngClass]="{'own-progress': isOwnMessage, 'partner-progress': !isOwnMessage}"
                [style.width]="audioProgress + '%'"
              ></div>
            </div>
          </div>
          <span class="audio-time">0:{{ audioLength < 10 ? '0' + audioLength : audioLength }}</span>
        </div>
        
        <!-- Message timestamp and status -->
        <div class="message-meta">
          <span class="message-time">{{ message.timestamp | date:'shortTime' }}</span>
          <span *ngIf="isOwnMessage" class="message-status">
            <svg *ngIf="message.read" class="check-icon double-check read" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor"/>
            </svg>
            <svg *ngIf="!message.read" class="check-icon double-check sent" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor"/>
            </svg>
          </span>
        </div>
        
        <!-- Message tail -->
        <div *ngIf="isOwnMessage" class="tail own-tail"></div>
        <div *ngIf="!isOwnMessage" class="tail partner-tail"></div>
      </div>
    </div>
  `,
  styles: [
    `
    .message-container {
      display: flex;
      margin-bottom: 4px;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .own-message {
      justify-content: flex-end;
    }
    
    .partner-message {
      justify-content: flex-start;
    }
    
    .message-bubble {
      position: relative;
      max-width: 75%;
      padding: 8px 12px;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      margin-bottom: 4px;
    }
    
    .own-message .message-bubble {
      background-color: #d9fdd3;
      border-top-right-radius: 0;
    }
    
    .partner-message .message-bubble {
      background-color: white;
      border-top-left-radius: 0;
    }
    
    .sender-name {
      font-size: 12px;
      font-weight: 500;
      color: #0066cc;
      margin-bottom: 4px;
    }
    
    .message-text {
      font-size: 14px;
      color: #333;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.4;
    }
    
    .voice-message {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .play-button {
      padding: 8px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
    }
    
    .own-play-button {
      background-color: #25D366;
    }
    
    .partner-play-button {
      background-color: #0066cc;
    }
    
    .play-icon {
      height: 20px;
      width: 20px;
      color: white;
    }
    
    .audio-progress-container {
      flex: 1;
    }
    
    .audio-progress-bar {
      height: 4px;
      background-color: #e0e0e0;
      border-radius: 2px;
    }
    
    .audio-progress {
      height: 4px;
      border-radius: 2px;
      transition: width 0.1s linear;
    }
    
    .own-progress {
      background-color: #25D366;
    }
    
    .partner-progress {
      background-color: #0066cc;
    }
    
    .audio-time {
      font-size: 12px;
      color: #666;
      min-width: 30px;
      text-align: right;
    }
    
    .message-meta {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 4px;
      gap: 4px;
    }
    
    .message-time {
      font-size: 10px;
      color: #666;
    }
    
    .check-icon {
      height: 14px;
      width: 16px;
    }
    
    .double-check {
      position: relative;
    }
    
    .read {
      color: #34B7F1;
    }
    
    .sent {
      color: #999;
    }
    
    .tail {
      position: absolute;
      top: 0;
      width: 12px;
      height: 12px;
    }
    
    .own-tail {
      right: -6px;
      background-color: #d9fdd3;
      clip-path: polygon(0 0, 0% 100%, 100% 0);
    }
    
    .partner-tail {
      left: -6px;
      background-color: white;
      clip-path: polygon(100% 0, 0 0, 100% 100%);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .message-bubble {
        max-width: 85%;
      }
    }
    
    @media (max-width: 480px) {
      .message-bubble {
        max-width: 90%;
        padding: 6px 10px;
      }
      
      .message-text {
        font-size: 13px;
      }
      
      .play-button {
        width: 32px;
        height: 32px;
        padding: 6px;
      }
      
      .play-icon {
        height: 18px;
        width: 18px;
      }
    }
  `,
  ],
})
export class MessageBubbleComponent implements OnInit {
  @Input() message!: Message
  @Input() isOwnMessage = false
  @Input() partnerName: string | null = null
  @Input() showNames = true
  audioProgress = 0
  audioLength = 15 // Default length in seconds
  audioPlayer: HTMLAudioElement | null = null

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Calculate audio length if it's a voice message
    if (this.message.type === "voice") {
      this.calculateAudioLength()
    }
  }

  calculateAudioLength(): void {
    if (this.message.type === "voice") {
      const audio = new Audio(this.message.content)
      audio.addEventListener("loadedmetadata", () => {
        this.audioLength = Math.round(audio.duration)
      })
    }
  }

  playVoiceMessage(base64Audio: string): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause()
      this.audioPlayer = null
      this.audioProgress = 0
      return
    }

    this.audioPlayer = new Audio(base64Audio)

    this.audioPlayer.addEventListener("timeupdate", () => {
      if (this.audioPlayer) {
        this.audioProgress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100
      }
    })

    this.audioPlayer.addEventListener("ended", () => {
      this.audioPlayer = null
      this.audioProgress = 0
    })

    this.audioPlayer.play()
  }
}
