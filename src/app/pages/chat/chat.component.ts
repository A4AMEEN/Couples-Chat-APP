import {
  Component,
  type OnInit,
  type OnDestroy,
  ViewChild,
  type ElementRef,
  type AfterViewChecked,
  HostListener,
   ChangeDetectorRef,
   Input,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  { Router } from "@angular/router"
import { type Subscription, fromEvent } from "rxjs"
import { debounceTime, distinctUntilChanged } from "rxjs/operators"
import  { AuthService, User } from "../../services/auth.service"
import  { ChatService, Message } from "../../services/chat.service"
import  { NotificationService } from "../../services/notification.service"
import { VoiceRecorderComponent } from "../../components/voice-recorder/voice-recorder.component"
import { MessageBubbleComponent } from "../../components/message-bubble/message-bubble.component"

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header" [attr.data-emoji]="headerEmoji">
        {{ headerTitle }}
      </div>
      
      <div class="chat-messages" #messageContainer>
        <!-- Messages -->
        <div 
          *ngFor="let message of messages" 
          class="message" 
          [ngClass]="{'outgoing': message.senderName === currentUser?.name, 'incoming': message.senderName !== currentUser?.name}"
        >
          <div class="avatar">
            {{ message.senderName?.charAt(0).toUpperCase() }}
          </div>
          <div class="bubble">
            <!-- Text message -->
            <div *ngIf="message.type === 'text'">
              {{ message.content }}
            </div>
            <!-- Basic Voice message display (can be enhanced later) -->
            <div *ngIf="message.type === 'voice'">
              <i>Voice Message</i> 
              <!-- Add play button or visualizer if needed -->
            </div>
          </div>
          <!-- Timestamp could be added here or inside the bubble -->
        </div>
      </div>

      <!-- Voice recording indicator (optional, adapt styling) -->
      <div *ngIf="isRecording" class="voice-recording-indicator">
        Recording... {{ recordingTime }}s
      </div>

      <!-- New Input Area -->
      <div class="chat-input">
        <input 
          type="text" 
          #messageInput
          [(ngModel)]="messageText" 
          (keyup.enter)="sendMessage()"
          placeholder="Type a sweet message..." 
        />
        <!-- Voice button removed -->
        
        <!-- Send button - Always visible -->
        <button (click)="sendMessage()">Send</button>
      </div>
    </div>
  `,
  styles: [
    `
    :host { /* Ensure component styles are encapsulated */
      display: block;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #ffd6ec, #d0f1ff);
      font-family: 'Quicksand', sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .chat-container {
      width: 380px;
      height: 620px;
      background-color: #fff;
      border-radius: 30px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .chat-header {
      background-color: #ff92b2;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      position: relative;
      flex-shrink: 0; /* Prevent header from shrinking */
    }

    .chat-header::after {
      content: "💖";
      position: absolute;
      right: 20px;
      top: 20px;
    }

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background-color: #fffafc;
      scroll-behavior: smooth;
    }

    .message {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }

    .avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: #ffc0cb; /* Default, can be customized */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      color: white;
      flex-shrink: 0;
    }
    
    /* Differentiate avatar colors */
    .incoming .avatar {
      background-color: #b2e8ff; /* Color for partner avatar */
    }
    
    .outgoing .avatar {
       background-color: #ffb2d8; /* Color for own avatar */
    }

    .bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 20px;
      font-size: 15px;
      animation: pop 0.3s ease-out;
      word-wrap: break-word; /* Ensure long words wrap */
    }

    @keyframes pop {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .incoming .bubble {
      background-color: #f5f5f5;
      border-top-left-radius: 0;
      color: #333;
    }

    .outgoing {
      flex-direction: row-reverse;
    }

    .outgoing .bubble {
      background-color: #ffd6ec;
      color: #333;
      border-top-right-radius: 0;
    }

    .chat-input {
      display: flex;
      padding: 15px;
      border-top: 1px solid #eee;
      background-color: #fff;
      flex-shrink: 0; /* Prevent input area from shrinking */
    }

    .chat-input input {
      flex: 1;
      padding: 12px 15px;
      border: 2px solid #ffd6ec;
      border-radius: 25px;
      outline: none;
      font-size: 14px;
    }

    .chat-input button {
      background-color: #ff92b2;
      border: none;
      color: white;
      padding: 12px 18px;
      border-radius: 25px;
      margin-left: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    }

    .chat-input button:hover {
      background-color: #ff6f9f;
    }
    
    /* Basic style for voice recording indicator */
    .voice-recording-indicator {
        padding: 10px;
        text-align: center;
        background-color: #ffebeb;
        color: #d8000c;
        font-size: 14px;
    }
    `
  ]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild("messageContainer") private messageContainer!: ElementRef
  @ViewChild("messageInput") private messageInput!: ElementRef

  messages: any[] = []
  messageText = ""
  currentUser: User | null = null
  partnerName: string | null = null
  newMessageAlert = false
  isUserNearBottom = true
  isRecording = false
  mediaRecorder: MediaRecorder | null = null
  audioChunks: Blob[] = []
  recordingTime = 0
  recordingInterval: any

  // Add properties for dynamic header
  headerTitle: string = 'Lovely Chat'; // Default title
  headerEmoji: string = '💖'; // Default emoji

  private subscriptions: Subscription[] = []

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
    
    // Set partner name and dynamic header based on current user
    if (this.currentUser?.name === 'Allu') {
      this.partnerName = 'Safa';
      this.headerTitle = 'Cinderella';
      this.headerEmoji = '👸'; // Queen emoji for Cinderella
    } else if (this.currentUser?.name === 'Safa') {
      this.partnerName = 'Allu';
      this.headerTitle = 'Charming Prince';
      this.headerEmoji = '🤴'; // King emoji for Charming Prince
    }

    // Subscribe to messages
    this.subscriptions.push(
      this.chatService.messages$.subscribe((messages) => {
        const shouldScroll = this.isUserNearBottom;
        this.messages = messages
        this.cdr.detectChanges() // Ensure view updates
        if (shouldScroll) { 
          // Use timeout to allow DOM to update before scrolling
          setTimeout(() => this.scrollToBottom(), 0);
        }
      })
    )

    // Setup scroll listener
    // Use ngZone or other methods if scroll listener causes performance issues
    if (this.messageContainer?.nativeElement) {
         this.messageContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    } else {
        // If container isn't ready, setup might need delay or different hook
        setTimeout(() => {
             if (this.messageContainer?.nativeElement) {
                this.messageContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
             } 
        }, 0);
    } 
  }

  ngAfterViewChecked(): void {
      // Remove auto-scroll from here, handle in message subscription
      // if (this.isUserNearBottom) {
      //  this.scrollToBottom()
      // }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    if (this.messageContainer?.nativeElement) {
        this.messageContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this))
    }
  }

  onScroll() {
    this.checkIfUserNearBottom()
  }

  private checkIfUserNearBottom(): void {
    const container = this.messageContainer.nativeElement
    const threshold = 50 // Adjust threshold if needed
    this.isUserNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }

  scrollToBottom(): void {
     try {
       if (this.messageContainer?.nativeElement) {
         const container = this.messageContainer.nativeElement;
         container.scrollTop = container.scrollHeight;
       }
     } catch(err) { 
       console.error("Error scrolling to bottom:", err);
     }
     this.newMessageAlert = false // Keep if needed for a different notification
  }

  sendMessage(): void {
    if (!this.messageText.trim()) return

    this.chatService.sendMessage(this.messageText).subscribe({
        next: () => {
        this.messageText = ''
        // Scrolling is now handled in the message subscription
      },
      error: (err) => {
        console.error('Error sending message:', err)
      }
    })
  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []
        this.recordingTime = 0
        this.isRecording = true

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data)
        }

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          const reader = new FileReader()
          reader.readAsDataURL(audioBlob)
          reader.onloadend = () => {
            this.chatService.sendMessage(reader.result as string, 'voice').subscribe({
              next: () => {
                // Scrolling handled in subscription
              },
              error: (err) => {
                console.error('Error sending voice message:', err)
              }
            })
          }
        }

        this.mediaRecorder.start()
        this.recordingInterval = setInterval(() => {
          this.recordingTime++
        }, 1000)
      })
      .catch(err => {
        console.error('Error accessing microphone:', err)
      })
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
    this.mediaRecorder.stop() // This triggers onstop which sends the message
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
    clearInterval(this.recordingInterval)
    this.isRecording = false
    }
  }
}
