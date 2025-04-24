import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { io,  Socket } from "socket.io-client"
import { environment } from "../../environments/environment"
import  { AuthService, User } from "./auth.service"

export interface Message {
  _id: string
  sender: string
  senderName: string
  content: string
  type: "text" | "voice"
  timestamp: Date
  read: boolean
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private socket: Socket
  private messagesSubject = new BehaviorSubject<Message[]>([])
  public messages$ = this.messagesSubject.asObservable()

  private typingSubject = new Subject<boolean>()
  public typing$ = this.typingSubject.asObservable()

  private partnerOnlineSubject = new BehaviorSubject<boolean>(false)
  public partnerOnline$ = this.partnerOnlineSubject.asObservable()

  private partnerSubject = new BehaviorSubject<User | null>(null)
  public partner$ = this.partnerSubject.asObservable()

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.socket = io(environment.socketUrl, {
      auth: {
        token: this.authService.getToken(),
      },
      transports: ["websocket"],
      upgrade: false,
    })

    this.setupSocketListeners()
    this.loadMessages()
    this.getPartner()
  }

  private setupSocketListeners(): void {
    this.socket.on("connect", () => {
      console.log("Connected to socket server")
      this.authService.updateOnlineStatus(true).subscribe()
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
    })

    this.socket.on("message", (message: Message) => {
      const currentMessages = this.messagesSubject.value

      // Check if message already exists to avoid duplicates
      const messageExists = currentMessages.some((m) => m._id === message._id)
      if (!messageExists) {
        this.messagesSubject.next([...currentMessages, message])

        // Mark message as read if we're the recipient
        if (message.sender !== this.authService.getCurrentUser()?._id) {
          this.markAsRead(message._id).subscribe()
        }
      }
    })

    this.socket.on("message-read", (messageId: string) => {
      const currentMessages = this.messagesSubject.value
      const updatedMessages = currentMessages.map((msg) => {
        if (msg._id === messageId) {
          return { ...msg, read: true }
        }
        return msg
      })
      this.messagesSubject.next(updatedMessages)
    })

    this.socket.on("typing", (isTyping: boolean) => {
      this.typingSubject.next(isTyping)
    })

    this.socket.on("partner-status", (isOnline: boolean) => {
      this.partnerOnlineSubject.next(isOnline)
    })

    // Handle alerts
    this.socket.on("alert", () => {
      // Show a browser notification
      if (Notification.permission === "granted") {
        const notification = new Notification("WhatsApp Alert", {
          body: `${this.partnerSubject.value?.name || "Your partner"} is trying to reach you!`,
          icon: "assets/images/whatsapp-logo.png",
        })

        // Close the notification after 5 seconds
        setTimeout(() => notification.close(), 5000)
      }
    })
  }

  loadMessages(): void {
    this.http.get<Message[]>(`${environment.apiUrl}/messages`).subscribe((messages) => {
      console.log(messages)
      this.messagesSubject.next(messages)
    })
  }

  getPartner(): void {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return

    // Set partner based on current user
    const partnerName = currentUser.name === 'Allu' ? 'Safa' : 'Allu'
    
    this.http.get<User>(`${environment.apiUrl}/users/partner/${partnerName}`).subscribe((partner) => {
      this.partnerSubject.next(partner)
      this.partnerOnlineSubject.next(partner.isOnline)
    })
  }

  sendMessage(content: string, type: "text" | "voice" = "text"): Observable<Message> {
    const currentUser = this.authService.getCurrentUser()
    console.log("currentUser",currentUser)
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const message = {
      content,
      type,
      timestamp: new Date(),
      read: false,
      senderName: currentUser.name,
      sender: currentUser._id
    }
    console.log("data",message)

    return new Observable<Message>((observer) => {
      this.http.post<Message>(`${environment.apiUrl}/messages`, message).subscribe({
        next: (savedMessage) => {
          // Update local messages immediately
          const currentMessages = this.messagesSubject.value
          this.messagesSubject.next([...currentMessages, savedMessage])

          // Emit the message through socket for real-time delivery
          this.socket.emit("message", savedMessage)

          observer.next(savedMessage)
          observer.complete()
        },
        error: (err) => {
          observer.error(err)
        },
      })
    })
  }

  markAsRead(messageId: string): Observable<Message> {
    return new Observable<Message>((observer) => {
      this.http.patch<Message>(`${environment.apiUrl}/messages/${messageId}/read`, {}).subscribe({
        next: (updatedMessage) => {
          // Update local message
          const currentMessages = this.messagesSubject.value
          const updatedMessages = currentMessages.map((msg) => {
            if (msg._id === messageId) {
              return { ...msg, read: true }
            }
            return msg
          })
          this.messagesSubject.next(updatedMessages)

          // Emit message-read event to notify sender
          this.socket.emit("message-read", messageId)

          observer.next(updatedMessage)
          observer.complete()
        },
        error: (err) => {
          observer.error(err)
        },
      })
    })
  }

  sendTypingStatus(isTyping: boolean): void {
    this.socket.emit("typing", isTyping)
  }

  sendAlert(): void {
    this.socket.emit("alert")
  }

  disconnect(): void {
    this.socket.disconnect()
    this.authService.updateOnlineStatus(false).subscribe()
  }

  reconnect(): void {
    if (this.socket.disconnected) {
      this.socket.connect()
    }
  }
}
