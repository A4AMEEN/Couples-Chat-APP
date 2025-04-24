import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, tap } from "rxjs"
import { environment } from "../../environments/environment"

export interface User {
  _id: string
  name: string
  isOnline: boolean
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    const user = localStorage.getItem("user")
    if (user) {
      this.currentUserSubject.next(JSON.parse(user))
    }
  }

  login(name: string, userId: string): Observable<{ user: User; token: string }> {
    console.log(name, userId)
    return this.http.post<{ user: User; token: string }>(`${environment.apiUrl}/auth/login`, { name, userId }).pipe(
      tap((response) => {
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))
        this.currentUserSubject.next(response.user)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.currentUserSubject.next(null)
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token")
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  updateOnlineStatus(isOnline: boolean): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/status`, { isOnline }).pipe(
      tap((user) => {
        const currentUser = this.getCurrentUser()
        if (currentUser) {
          const updatedUser = { ...currentUser, isOnline }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          this.currentUserSubject.next(updatedUser)
        }
      }),
    )
  }
}
